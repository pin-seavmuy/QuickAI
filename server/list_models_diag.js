import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listModels() {
    try {
        const envPath = path.resolve(__dirname, './.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        const keyLine = lines.find(l => l.startsWith('GROQ_API_KEY='));
        if (!keyLine) throw new Error('GROQ_API_KEY not found');
        const apiKey = keyLine.split('=')[1].trim();

        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const models = response.data.data.map(m => m.id);
        const visionModels = models.filter(id => id.toLowerCase().includes('vision'));
        
        console.log('--- ALL GROQ MODELS ---');
        console.log(JSON.stringify(models, null, 2));
        console.log('\n--- VISION MODELS ---');
        console.log(JSON.stringify(visionModels, null, 2));
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

listModels();
