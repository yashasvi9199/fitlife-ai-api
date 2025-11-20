const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  try {
    // ANALYZE IMAGE
    if (method === 'POST' && action === 'analyze') {
      const { image } = req.body;
      
      // Use signed upload (no preset needed)
      const result = await cloudinary.uploader.upload(image, {
        folder: 'fitlife-food-images'
      });

      // Simulate nutrition analysis (replace with actual AI)
      const calories = Math.floor(Math.random() * 500) + 100;

      return res.status(200).json({
        image_url: result.secure_url,
        calories,
        nutrition: { protein: 15, carbs: 45, fat: 10 }
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

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
