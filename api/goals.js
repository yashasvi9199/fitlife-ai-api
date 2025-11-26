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

    // SET GOAL
    if (method === 'POST' && action === 'set') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { type, target } = req.body;
      
      // Validate target value
      const numTarget = parseFloat(target);
      if (isNaN(numTarget) || numTarget <= 0) {
        return res.status(400).json({ error: 'Invalid target value' });
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([{ user_id: req.user.id, type, target }])
        .select();

      if (error) throw new Error(error.message);
      return res.status(200).json(data[0]);
    }

    // GET GOALS
    if (method === 'GET' && action === 'list') {
      req.query.user_id = req.query.user_id || req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', req.authorizedUserId);

      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    }

    // UPDATE GOAL
    if (method === 'PUT' && action === 'update') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { id, target } = req.body;
      
      // Validate target value
      const numTarget = parseFloat(target);
      if (isNaN(numTarget) || numTarget <= 0) {
        return res.status(400).json({ error: 'Invalid target value' });
      }

      const { data, error } = await supabase
        .from('goals')
        .update({ target })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

      if (error) throw new Error(error.message);
      return res.status(200).json(data[0]);
    }

    // DELETE GOAL
    if (method === 'DELETE' && action === 'delete') {
      req.query.user_id = req.query.user_id || req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { id } = req.query;
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) throw new Error(error.message);
      return res.status(200).json({ message: 'Goal deleted successfully' });
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    // Use centralized error handling
    return errorHandler(error, req, res);
  }
}

module.exports = handler;
module.exports.default = handler;
