import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function test() {
    try {
        console.log("Testing Gemini with model: gemini-1.5-flash...");
        const response = await AI.chat.completions.create({
            model: "gemini-1.5-flash",
            messages: [{ role: "user", content: "Hello, say 'Test OK'" }],
            temperature: 0.7,
            max_tokens: 10,
        });
        console.log("Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
    }
}

test();
