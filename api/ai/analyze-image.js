const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { image } = req.body;
    const result = await cloudinary.uploader.upload(image, {
      upload_preset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET
    });
    
    // Simulate nutrition analysis (replace with Open Food Facts)
    const calories = Math.floor(Math.random() * 500) + 100;
    
    return res.status(200).json({ 
      image_url: result.secure_url,
      calories,
      nutrition: { protein: 15, carbs: 45, fat: 10 }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}