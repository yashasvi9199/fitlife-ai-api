// Authentication middleware for FitLife AI API
const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseServiceRoleKey } = require('../config/env');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const extractUserId = (req) => {
  if (req.body && req.body.user_id) return req.body.user_id;
  if (req.query && req.query.user_id) return req.query.user_id;
  if (req.params && req.params.user_id) return req.params.user_id;
  return null;
};

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const authorizeUser = (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const requestedUserId = extractUserId(req) || req.user.id;

  if (!requestedUserId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  if (req.user.id !== requestedUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  req.authorizedUserId = requestedUserId;
  next();
};

module.exports = { authenticateUser, authorizeUser };
