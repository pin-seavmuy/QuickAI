import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

const AI = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

async function listModels() {
    try {
        const models = await AI.models.list();
        console.log(JSON.stringify(models, null, 2));
    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listModels();
