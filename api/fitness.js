const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  try {
    // CREATE ROUTINE
    if (method === 'POST' && action === 'create') {
      const { user_id, name, exercises } = req.body;
      const { data, error } = await supabase
        .from('fitness_routines')
        .insert([{ user_id, name, exercises }])
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    // GET ROUTINES
    if (method === 'GET' && action === 'list') {
      const { user_id } = req.query;
      const { data, error } = await supabase
        .from('fitness_routines')
        .select('*')
        .eq('user_id', user_id);

      if (error) throw error;
      return res.status(200).json(data);
    }

    // UPDATE ROUTINE
    if (method === 'PUT' && action === 'update') {
      const { id, name, exercises } = req.body;
      const { data, error } = await supabase
        .from('fitness_routines')
        .update({ name, exercises })
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
