const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const handleCors = require('./utils/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { method } = req;
  const { action } = req.query;

  try {
    // GET CONFIG - Return public Supabase config
    if (method === 'GET' && action === 'config') {
      return res.status(200).json({
        url: process.env.VITE_SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY
      });
    }

    // SIGNUP
    if (method === 'POST' && action === 'signup') {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto-confirm for easier testing
      });

      if (error) throw error;
      return res.status(200).json({ user: data.user });
    }

    // SIGNIN (verify credentials)
    if (method === 'POST' && action === 'signin') {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return res.status(200).json({
        user: data.user,
        session: data.session
      });
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
