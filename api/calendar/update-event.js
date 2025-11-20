const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { id, completed } = req.body;
    
    const { data, error } = await supabase
      .from('calendar_events')
      .update({ completed, updated_at: new Date() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}