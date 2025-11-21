const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    // CREATE EVENT
    if (method === 'POST' && action === 'create') {
      const { user_id, title, type, date } = req.body;
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ user_id, title, type, date, completed: false }])
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    // GET EVENTS
    if (method === 'GET' && action === 'list') {
      const { user_id, date } = req.query;
      let query = supabase.from('calendar_events').select('*').eq('user_id', user_id);
      if (date) query = query.eq('date', date);

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    // UPDATE EVENT
    if (method === 'PUT' && action === 'update') {
      const { id, completed } = req.body;
      const { data, error } = await supabase
        .from('calendar_events')
        .update({ completed })
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
