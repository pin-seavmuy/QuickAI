const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function listModels() {
    try {
        const envPath = path.resolve(__dirname, '../server/.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const keyMatch = envContent.match(/GROQ_API_KEY=(.*)/);
        if (!keyMatch) throw new Error('GROQ_API_KEY not found in .env');
        const apiKey = keyMatch[1].trim();

        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const visionModels = response.data.data
            .filter(m => m.id.toLowerCase().includes('vision'))
            .map(m => m.id);

        console.log('Available Vision Models:');
        console.log(JSON.stringify(visionModels, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
