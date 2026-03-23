import OpenAI from "openai";
import { clerkClient } from "@clerk/express";
import fs from "fs";
import sql from "../configs/db.js";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import FormData from "form-data";
import pdf from "pdf-parse/lib/pdf-parse.js";
// import  pdf from "pdf-parse";




const AI = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});


export const generateArticle = async (req, res)=>{
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({ success: false, message: "Limit reached. Upgrade continue."})
        }
        const fullPrompt = `Write a professional, long-form article about: ${prompt}.\n\nRequirements:\n- Approximate length: ${length} words.\n- Use an engaging and informative tone.\n- MANDATORY: Use Markdown syntax throughout (e.g., # Main Title, ## Section Headings, **Bold** important terms, and bulleted lists).\n- Include a compelling H1 title at the very beginning.\n- Structure logically with H2 and H3 subheadings for clarity.\n- Ensure the content is unique and well-structured for readability.`;

        const response = await AI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {   role: "user",
                    content: fullPrompt,
                },
            ],
            temperature: 0.7,
            max_tokens: Math.floor(length * 1.5),
        });

        let content = response.choices[0].message.content;

        // 🔥 FIX: handle string OR array
        if (Array.isArray(content)) {
            content = content.map(part => part.text || "").join("");
        }

        
        await sql` INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content})
    } catch (error) {
        console.log("AI Article Error:", error.message);
        let userMessage = error.message;
        if (error.status === 429) {
            userMessage = "AI Rate limit reached. Please wait a few seconds and try again.";
        }
        res.json({success: false, message: userMessage})
    }
}




export const generateBlogTitle = async (req, res)=>{
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({ success: false, message: "Limit reached. Upgrade continue."})
        }
        const promptWithInstructions = `Generate 5-10 catchy and professional blog titles for the topic: ${prompt}.\n\nRequirements:\n- Ensure titles are SEO-friendly and engaging.\n- Format as a clear, bulleted list in Markdown.\n- Provide a variety of styles (Listicles, How-to, Question-based).`;

        const response = await AI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: promptWithInstructions, }, ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const content = response.choices[0].message.content
        
        await sql` INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content})
    } catch (error) {
        console.log("AI Generation Error:", error.message);
        let userMessage = error.message;
        if (error.status === 429) {
            userMessage = "AI Rate limit reached. Please wait a few seconds and try again.";
        }
        res.json({success: false, message: userMessage})
    }
}


export const generateImage = async (req, res)=>{
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({ success: false, message: "This feature is only available for premium subscriptions."})
        }
        
        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
            responseType: "arraybuffer"
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const {secure_url} =  await cloudinary.uploader.upload(base64Image)
        
        await sql` INSERT INTO creations (user_id, prompt, content, type, publish)
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url})
    } catch (error) {
        console.log("AI Image Error:", error.message);
        let userMessage = error.message;
        if (error.status === 429) {
            userMessage = "AI Rate limit reached. Please wait a few seconds and try again.";
        }
        res.json({success: false, message: userMessage})
    }
}


export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth(); 
    const image = req.file;       
    const plan = req.plan;       

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions."
      });
    }

    // 1. Upload original version for comparison
    const original = await cloudinary.uploader.upload(image.path, {
      format: "png",
    });

    // 2. Upload with background removal
    const processed = await cloudinary.uploader.upload(image.path, {
      format: "png",                   
      background_removal: "cloudinary_ai",
      transformation: [{ effect: "background_removal" }]
    });

    // Remove temporary local file
    fs.unlinkSync(image.path);

    const dualContent = `${original.secure_url}|${processed.secure_url}`;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${dualContent}, 'remove-background')
    `;

    res.json({ success: true, content: processed.secure_url });

  } catch (error) {
    console.log("AI Background Removal Error:", error.message);
    let userMessage = error.message;
    if (error.status === 429) {
      userMessage = "AI Rate limit reached. Please wait a few seconds and try again.";
    }
    res.json({ success: false, message: userMessage });
  }
};

export const removeImageObject = async (req, res)=>{
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({ success: false, message: "This feature is only available for premium subscriptions."})
        }

        // 1. Upload original version for comparison
        const original = await cloudinary.uploader.upload(image.path, {
            format: "png",
        });

        // 2. Upload with generative removal
        // Important: use gen_remove:prompt_ syntax and ensure prompt is safe for transformation string
        const processed = await cloudinary.uploader.upload(image.path, {
            format: "png",
            transformation: [{ effect: `gen_remove:prompt_${object.replace(/ /g, '_')}` }]
        });

        // Cleanup local file
        fs.unlinkSync(image.path);
        
        const dualContent = `${original.secure_url}|${processed.secure_url}`;

        await sql` INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${`Removed ${object} from image`}, ${dualContent}, 'remove-object')`;

        res.json({ success: true, content: processed.secure_url })
    } catch (error) {
        console.log("AI Generation Error:", error.message);
        let userMessage = error.message;
        if (error.status === 429) {
            userMessage = "AI Rate limit reached. Please wait a few seconds and try again.";
        }
        res.json({success: false, message: userMessage})
    }
}

export const resumeReview = async (req, res)=>{
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({ success: false, message: "This feature is only available for premium subscriptions."})
        }

        
        if(resume.size > 5 * 1024 * 1024){
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB). "})
        }

        const dataBuffer = fs.readFileSync(resume.path)
        // const pdfData = await pdf(dataBuffer)
        const pdfData = await pdf(dataBuffer);
        // const pdfData = await pdf.default(dataBuffer);


        const prompt = `Review the following resume and provide professional, constructive feedback. \n\nRequirements:\n- Structure your response using Markdown (H2 for sections, bullet points for clarity).\n- Highlight Strengths, Weaknesses, and specific Actionable Improvements.\n- Use a helpful, career-coach tone.\n\nResume Content:\n\n${pdfData.text}`

        const response = await AI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt, }, ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content
        
        await sql` INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

        res.json({ success: true, content})
    } catch (error) {
        console.log("AI Generation Error:", error.message);
        let userMessage = error.message;
        if (error.status === 429) {
            userMessage = "AI Rate limit reached. Please wait a few seconds and try again.";
        }
        res.json({success: false, message: userMessage})
    }
}

export const upscaleImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." });
        }

        // 1. Upload original version for comparison
        const original = await cloudinary.uploader.upload(image.path, {
            format: "png",
        });

        // 2. Upload upscaled version with generative restoration
        const upscaled = await cloudinary.uploader.upload(image.path, {
            format: "png",
            effect: "gen_restore",
            transformation: [
                { width: 2048, crop: "limit" },
                { effect: "unsharp_mask:80" }
            ]
        });

        // Cleanup local file
        fs.unlinkSync(image.path);

        // Store both URLs in a delimiter-separated format
        const dualContent = `${original.secure_url}|${upscaled.secure_url}`;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'AI Upscale & Restore', ${dualContent}, 'upscale')
        `;

        res.json({ success: true, content: upscaled.secure_url });

    } catch (error) {
        console.log("AI Upscale Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export const reverseImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        if (!req.file) {
            return res.json({ success: false, message: "No image uploaded." });
        }

        // Read image and convert to base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const response = await AI.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze the aesthetics, lighting, composition, and subjects of this image. Based on your analysis, generate a creative text-to-image prompt that would reproduce its essence. Provide ONLY the final prompt text." },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        const promptResult = response.choices[0].message.content;

        // Save to database
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Reverse AI Analytics', ${promptResult}, 'reverse-ai')
        `;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, prompt: promptResult });

        // Cleanup: remove the temporary uploaded file
        fs.unlinkSync(req.file.path);

    } catch (error) {
        console.log("Reverse AI Error:", error.message);
        res.json({ success: false, message: error.message || "Failed to analyze image." });
    }
};

export const swapBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." });
        }

        if (!image) {
            return res.json({ success: false, message: "No image uploaded." });
        }

        // 1. Upload original version for comparison
        const original = await cloudinary.uploader.upload(image.path, {
            format: "png",
        });

        // 2. Upload with generative background replacement
        const processed = await cloudinary.uploader.upload(image.path, {
            format: "png",
            transformation: [{ effect: `gen_background_replace:prompt_${prompt.replace(/ /g, '_')}` }]
        });

        // Cleanup local file
        fs.unlinkSync(image.path);

        const dualContent = `${original.secure_url}|${processed.secure_url}`;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${`Swap background to: ${prompt}`}, ${dualContent}, 'bg-swap')
        `;

        res.json({ success: true, content: processed.secure_url });

    } catch (error) {
        console.log("AI Background Swap Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};
