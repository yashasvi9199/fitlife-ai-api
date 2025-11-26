const { createClient } = require('@supabase/supabase-js');
const { authenticateUser, authorizeUser } = require('../middleware/auth');
const { validateHealthRecord } = require('../middleware/validation');
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
    // Apply authentication and authorization
    await authenticateUser(req, res, () => {});
    
    // CREATE RECORD (Single or Multiple)
    if (method === 'POST' && action === 'create') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      await validateHealthRecord(req, res, () => {});
      
      const body = req.body;
      let recordsToInsert = [];

      if (Array.isArray(body)) {
        recordsToInsert = body.map(record => ({
          user_id: req.user.id,
          type: record.type,
          value: record.value,
          date: record.date || new Date().toISOString().split('T')[0]
        }));
      } else {
        recordsToInsert = [{
          user_id: req.user.id,
          type: body.type,
          value: body.value,
          date: body.date || new Date().toISOString().split('T')[0]
        }];
      }

      const { data, error } = await supabase
        .from('health_records')
        .insert(recordsToInsert)
        .select();
      
      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    }

    // UPDATE RECORD
    if (method === 'PUT' && action === 'update') {
      req.body.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      await validateHealthRecord(req, res, () => {});
      
      const { id, type, value, date } = req.body;
      const { data, error } = await supabase
        .from('health_records')
        .update({ type, value, date })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

      if (error) throw new Error(error.message);
      return res.status(200).json(data[0]);
    }

    // DELETE RECORD
    if (method === 'DELETE' && action === 'delete') {
      req.query.user_id = req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { id } = req.query;
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) throw new Error(error.message);
      return res.status(200).json({ message: 'Record deleted successfully' });
    }

    // GET RECORDS
    if (method === 'GET' && action === 'records') {
      req.query.user_id = req.query.user_id || req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { type } = req.query;
      let query = supabase
        .from('health_records')
        .select('*')
        .eq('user_id', req.authorizedUserId)
        .order('date', { ascending: false });
      
      if (type) query = query.eq('type', type);
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    }

    // GET STATS
    if (method === 'GET' && action === 'stats') {
      req.query.user_id = req.query.user_id || req.user.id;
      await authorizeUser(req, res, () => {});
      
      const { period } = req.query;
      let dateFilter = new Date();

      if (period === '7days') dateFilter.setDate(dateFilter.getDate() - 7);
      if (period === '30days') dateFilter.setDate(dateFilter.getDate() - 30);

      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', req.authorizedUserId)
        .gte('date', dateFilter.toISOString().split('T')[0]);

      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    // Use centralized error handling
    return errorHandler(error, req, res);
  }
}

module.exports = handler;
module.exports.default = handler;
