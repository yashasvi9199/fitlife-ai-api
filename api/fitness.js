const { createClient } = require('@supabase/supabase-js');
const { authenticateUser, authorizeUser } = require('../middleware/auth');
const { errorHandler } = require('../utils/errorHandler');
const { supabaseUrl, supabaseServiceRoleKey } = require('../config/env');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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

    // CREATE ROUTINE
    if (method === 'POST' && action === 'create') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { name, exercises } = req.body;
      
      // Validate exercises array
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ error: 'Exercises array required' });
      }

      const { data, error } = await supabase
        .from('fitness_routines')
        .insert([{ user_id: req.user.id, name, exercises }])
        .select();

      if (error) throw new Error(error.message);
      return res.status(200).json(data[0]);
    }

    // GET ROUTINES
    if (method === 'GET' && action === 'list') {
      req.query.user_id = req.query.user_id || req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { data, error } = await supabase
        .from('fitness_routines')
        .select('*')
        .eq('user_id', req.authorizedUserId);

      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    }

    // UPDATE ROUTINE
    if (method === 'PUT' && action === 'update') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { id, name, exercises } = req.body;
      
      // Validate exercises array
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ error: 'Exercises array required' });
      }

      const { data, error } = await supabase
        .from('fitness_routines')
        .update({ name, exercises })
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
