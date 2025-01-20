import  express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());

// Middleware for parsing JSON request bodies
app.use(express.json());// For parsing JSON request bodies

// Replace with your actual Gemini API Key
const geminiApiKey = "AIzaSyA0lW9gpaZK8_f-ksnpqt8ciAXIjYlqncI";
const model = "gemini-pro";

app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/gemini-response', async (req, res) => {
    const prompt = req.body.prompt;
    if(!prompt){
      return res.status(400).send("Must send a prompt")
    }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
    const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
      }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
           headers: {
              'Content-Type': 'application/json',
           },
           body: JSON.stringify(requestBody),
        });

       if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }
       const data = await response.json();
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
          res.json({ response: data.candidates[0].content.parts[0].text });
      } else {
         res.status(500).json({error: "Sorry, I could not generate a response."});
       }
    } catch (error) {
        console.error('Error fetching Gemini response:', error);
        res.status(500).json({ error: "Sorry, something went wrong with the Gemini API."});
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});