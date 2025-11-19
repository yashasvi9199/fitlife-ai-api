const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  
  //Debugging log
  console.log('Environment check:', {
      hasUrl: !!process.env.VITE_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

  const { method } = req; // Fix for method not found
  if (method === 'POST') {
    try {
      const { user_id, type, value, date } = req.body;
      const { data, error } = await supabase
        .from('health_records')
        .insert([{ user_id, type, value, date }])
        .select();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: error.message });
    }
  }
}