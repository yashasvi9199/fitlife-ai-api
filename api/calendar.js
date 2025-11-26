const { createClient } = require('@supabase/supabase-js');
const { authenticateUser, authorizeUser } = require('../middleware/auth');
const { errorHandler } = require('../utils/errorHandler');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CORS configuration with allowed origins
const allowedOrigins = [
  'https://fitlife-ai.vercel.app',
  'https://yashasvi9199.github.io',
  'http://localhost:5173',
  'http://localhost:3000'
];

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
async function handler(req, res) {
  // Secure CORS handling
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const { action } = req.query;

  try {
    // Apply authentication
    await authenticateUser(req, res, () => {});

    // CREATE EVENT
    if (method === 'POST' && action === 'create') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { title, type, date } = req.body;
      
      // Validate required fields
      if (!title || title.length < 2) {
        return res.status(400).json({ error: 'Valid title required' });
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ user_id: req.user.id, title, type, date, completed: false }])
        .select();

      if (error) throw new Error(error.message);
      return res.status(200).json(data[0]);
    }

    // GET EVENTS
    if (method === 'GET' && action === 'list') {
      req.query.user_id = req.query.user_id || req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { date } = req.query;
      let query = supabase.from('calendar_events').select('*').eq('user_id', req.authorizedUserId);
      if (date) query = query.eq('date', date);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    }

    // UPDATE EVENT
    if (method === 'PUT' && action === 'update') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { id, completed } = req.body;
      const { data, error } = await supabase
        .from('calendar_events')
        .update({ completed })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

      if (error) throw new Error(error.message);
      return res.status(200).json(data[0]);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    // Use centralized error handling
    return errorHandler(error, req, res);
  }
}

module.exports = handler;
module.exports.default = handler;
