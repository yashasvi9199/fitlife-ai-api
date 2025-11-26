const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleCors = require('./utils/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { method } = req;
  const { action } = req.query;

  try {
    // ANALYZE IMAGE
    if (method === 'POST' && action === 'analyze') {
      const { image } = req.body;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(image, {
        folder: 'fitlife-food-images'
      });

      // Analyze with Gemini Vision
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Analyze this food image and provide nutrition information in JSON format.
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>
}
Estimate realistic values based on typical serving sizes.`;

      // Convert base64 to image part
      const imagePart = {
        inlineData: {
          data: image.split(',')[1], // Remove data:image/xxx;base64, prefix
          mimeType: image.split(';')[0].split(':')[1]
        }
      };

      const geminiResult = await model.generateContent([prompt, imagePart]);
      const responseText = geminiResult.response.text();

      // Parse JSON from response
      let nutritionData;
      try {
        // Remove markdown code blocks if present
        const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        nutritionData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', responseText);
        // Fallback to default values
        nutritionData = { calories: 250, protein: 15, carbs: 30, fat: 10 };
      }

      return res.status(200).json({
        image_url: result.secure_url,
        calories: nutritionData.calories,
        nutrition: {
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat
        }
      });
    }

    // GET NUTRITION DATA
    if (method === 'GET' && action === 'nutrition') {
      const { barcode } = req.query;

      // Use native https module
      const https = require('https');
      const nutritionData = await new Promise((resolve, reject) => {
        https.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      return res.status(200).json(nutritionData);
    }

    // ANALYZE HEALTH DATA
    if (method === 'POST' && action === 'analyze-health') {
      const { weight: weightData, steps, heart_rate, blood_pressure, blood_sugar, sleep_hours } = req.body;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Extract weight and height if weight is an object
      const weight = typeof weightData === 'object' && weightData !== null ? weightData.value : weightData;
      const height = typeof weightData === 'object' && weightData !== null ? weightData.height : null;

      const prompt = `You are a sophisticated health advisor AI. Analyze the following health metrics for a user:

Weight: ${weight || 'Not tracked'} kg${height ? `\nHeight: ${height} cm` : ''}
Steps: ${steps || 'Not tracked'}
Heart Rate: ${heart_rate || 'Not tracked'} bpm
Blood Pressure: ${blood_pressure || 'Not tracked'} mmHg
Blood Sugar: ${blood_sugar || 'Not tracked'} mg/dL
Sleep Hours: ${sleep_hours || 'Not tracked'} hours

${height && weight ? `Calculate BMI: ${(weight / ((height / 100) ** 2)).toFixed(1)} and include it in your weight analysis.` : ''}

Your task is to provide a structured analysis for EACH metric.
Return ONLY a valid JSON object with this exact structure (no markdown formatting, just raw JSON):

{
  "metrics": [
    {
      "title": "Weight Analysis",
      "icon": "⚖️",
      "analysis": "Brief analysis of weight status${height ? ' including BMI' : ''}...",
      "rating": 4
    },
    {
      "title": "Activity & Steps",
      "icon": "👣",
      "analysis": "Analysis of activity level...",
      "rating": 3
    },
    {
      "title": "Heart Health",
      "icon": "❤️",
      "analysis": "Analysis of heart rate and BP...",
      "rating": 5
    },
    {
      "title": "Blood Sugar",
      "icon": "🍬",
      "analysis": "Analysis of blood sugar levels...",
      "rating": 4
    },
    {
      "title": "Sleep Quality",
      "icon": "😴",
      "analysis": "Analysis of sleep patterns...",
      "rating": 2
    }
  ],
  "overall_summary": "One sentence summary of overall health."
}

For the 'rating', give a score from 1 to 5 stars based on global health standards (WHO/CDC). 5 is excellent, 1 is critical.`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Clean up any potential markdown code blocks from the response
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonStr);

        return res.status(200).json({ analysis });
      } catch (genError) {
        console.error('Gemini Generation Error:', genError);
        return res.status(500).json({
          error: 'Failed to generate analysis',
          details: genError.message
        });
      }
    }

    // GENERATE MOTIVATION QUOTE
    if (method === 'POST' && action === 'quote') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Generate a single, short, energetic, and inspirational health/fitness quote. 
      Return ONLY a JSON object with this structure:
      {
        "quote": "The quote text",
        "author": "Author Name or Unknown"
      }
      Do not use markdown.`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        return res.status(200).json(data);
      } catch (error) {
        console.error('Quote Generation Error:', error);
        // Fallback quote
        return res.status(200).json({
          quote: "The only bad workout is the one that didn't happen.",
          author: "Unknown"
        });
      }
    }

    // TEST CONNECTION
    if (method === 'POST' && action === 'test-connection') {
      try {
        // 1. List available models
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const listData = await listResponse.json();

        if (!listResponse.ok) {
          throw new Error(`Failed to list models: ${listData.error?.message || listResponse.statusText}`);
        }

        const availableModels = listData.models
          ? listData.models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name)
          : [];

        // 2. Try to generate content with a known model (preferring flash, then pro)
        const modelName = availableModels.find(m => m.includes('flash')) || availableModels.find(m => m.includes('pro')) || 'models/gemini-pro';

        // Clean up model name for SDK if needed (SDK usually takes 'gemini-pro', API returns 'models/gemini-pro')
        const sdkModelName = modelName.replace('models/', '');

        const model = genAI.getGenerativeModel({ model: sdkModelName });
        const prompt = "Hello, are you working? Reply with 'Yes'.";

        const result = await model.generateContent(prompt);
        const message = result.response.text();

        return res.status(200).json({
          message: message,
          testedModel: sdkModelName,
          availableModels: availableModels,
          status: 'connected'
        });
      } catch (error) {
        console.error('AI Connection Test Error:', error);
        return res.status(500).json({
          error: 'AI Connection Failed',
          details: error.message
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
