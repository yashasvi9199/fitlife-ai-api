const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  try {
    // SET GOAL
    if (method === 'POST' && action === 'set') {
      const { user_id, type, target } = req.body;
      const { data, error } = await supabase
        .from('goals')
        .insert([{ user_id, type, target }])
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    // GET GOALS
    if (method === 'GET' && action === 'list') {
      const { user_id } = req.query;
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user_id);

      if (error) throw error;
      return res.status(200).json(data);
    }

    // UPDATE GOAL
    if (method === 'PUT' && action === 'update') {
      const { id, target } = req.body;
      const { data, error } = await supabase
        .from('goals')
        .update({ target })
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
