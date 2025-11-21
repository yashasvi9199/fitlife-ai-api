const cloudinary = require('cloudinary').v2;
const { GoogleGenerativeAI } = require('@google/generative-ai');

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async function handler(req, res) {
  // CORS headers - Allow requests from frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
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
      const { steps, heart_rate, blood_pressure, blood_sugar, sleep_hours } = req.body;
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `You are a health advisor AI. Analyze the following health metrics and provide a concise, actionable health suggestion (max 2-3 sentences):

Steps: ${steps || 'Not tracked'}
Heart Rate: ${heart_rate || 'Not tracked'} bpm
Blood Pressure: ${blood_pressure || 'Not tracked'} mmHg (systolic)
Blood Sugar: ${blood_sugar || 'Not tracked'} mg/dL
Sleep Hours: ${sleep_hours || 'Not tracked'} hours

Compare these values with global medical standards and provide personalized advice. Be encouraging and specific.`;

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();
      
      return res.status(200).json({ analysis });
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
