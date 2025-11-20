const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { user_id, title, type, date } = req.body;
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{ user_id, title, type, date }])
      .select();
    
    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}