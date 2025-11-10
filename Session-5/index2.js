import 'dotenv/config';
import express from 'express';
import cors from 'cors'; // allow origin external
import { GoogleGenAI } from '@google/genai';

const app = express();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const {messages} = req.body;
    
    try {
        if(!Array.isArray(messages))
        {
            throw new Error('Messages should be an array!');
        }

        const contents = messages.map(({role, text}) => ({
            role,
            parts: [{ text }]
        }))

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents
        })

        res.status(200).json({ result: response.text })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});