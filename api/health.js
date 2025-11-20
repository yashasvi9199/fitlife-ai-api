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
    // CREATE RECORD
    if (method === 'POST' && action === 'create') {
      const { user_id, type, value, date } = req.body;
      const { data, error } = await supabase
        .from('health_records')
        .insert([{ user_id, type, value, date: date || new Date().toISOString().split('T')[0] }])
        .select();
      
      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    // GET RECORDS
    if (method === 'GET' && action === 'records') {
      const { user_id, type } = req.query;
      let query = supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user_id);
      
      if (type) query = query.eq('type', type);
      
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    // GET STATS
    if (method === 'GET' && action === 'stats') {
      const { user_id, period } = req.query;
      let dateFilter = new Date();

      if (period === '7days') dateFilter.setDate(dateFilter.getDate() - 7);
      if (period === '30days') dateFilter.setDate(dateFilter.getDate() - 30);

      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user_id)
        .gte('date', dateFilter.toISOString().split('T')[0]);

      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
