const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function listModels() {
    try {
        const envPath = path.resolve(__dirname, '../server/.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        const keyLine = lines.find(l => l.startsWith('GROQ_API_KEY='));
        if (!keyLine) throw new Error('GROQ_API_KEY not found');
        const apiKey = keyLine.split('=')[1].trim();

        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const models = response.data.data.map(m => m.id);
        console.log(JSON.stringify(models, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

listModels();
