const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const { action } = req.query;

  try {
    // GET CONFIG - Return public Supabase config
    if (method === 'GET' && action === 'config') {
      return res.status(200).json({
        url: process.env.SUPABASE_URL,
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
      
      // Immediately sign the user in so the client gets a session token
      const { data: sessionData, error: signinError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signinError) throw signinError;

      return res.status(200).json({ user: data.user, session: sessionData.session });
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

module.exports = handler;
module.exports.default = handler;
