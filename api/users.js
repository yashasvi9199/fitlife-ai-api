const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  try {
    // GET PROFILE
    if (method === 'GET' && action === 'profile') {
      const { user_id } = req.query;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // UPDATE PROFILE
    if (method === 'PUT' && action === 'profile') {
      const { user_id, name, age, gender, city, state, country, mobile } = req.body;
      const { data, error } = await supabase
        .from('profiles')
        .update({ name, age, gender, city, state, country, mobile })
        .eq('id', user_id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
