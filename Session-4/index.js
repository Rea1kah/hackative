import 'dotenv/config'; // Load environment variables from .env file
import express, { response } from 'express'; // Import Express framework
import multer from 'multer'; // Import Multer for handling file uploads
import fs from 'fs'; // Import File System module
import {GoogleGenAI} from '@google/genai' // Import GoogleGenAI from the genai package
import { text } from 'stream/consumers';
import { type } from 'os';

const app = express(); 
const upload = multer();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(express.json()); // Middleware to parse JSON request bodies

// endpoint untuk hasil teks dari prompt
app.post('/generate-text', async (req, res) => {
    const {prompt} = req.body;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        })

        res.status(200).json({result: response.text})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// endpoint untuk hasil teks dari gambar
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const {prompt} = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: 'text' },
                { inlineData: {
                    data: base64Image,
                    mimeType: req.file.mimetype
                }}
            ]
        })

        res.status(200).json({result: response.text})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// endpoint untuk generate from document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const {prompt} = req.body;
    const base64Document = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buatkan ringkasan untuk dokumen berikut" , type: 'text'},
                { inlineData: {
                    data: base64Document,
                    mimeType: req.file.mimetype
                }}
            ]
        })

        res.status(200).json({result: response.text})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// endpoint untuk generate dari audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => { // middleware multer digunakan untuk meng-handle file upload dengan field name 'audio'
    const {prompt} = req.body;
    const base64Audio = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {text: prompt || "Tolong buat transkrip dari audio berikut", type: 'text'},
                {inlineData: {
                    data: base64Audio,
                    mimeType: req.file.mimetype
                }}
            ]
        })

        res.status(200).json({result: response.text})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})