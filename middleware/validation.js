// Input validation middleware for FitLife AI API
const { sanitizeString, isValidNumber } = require('../utils/helpers');

const validateHealthRecord = (req, res, next) => {
  const { user_id, type, value, date } = req.body;
  
  // Validate required fields
  if (!user_id || !type || value === undefined || value === null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Sanitize inputs
  req.body.user_id = sanitizeString(user_id);
  req.body.type = sanitizeString(type);
  
  // Validate value based on type
  const maxValues = {
    weight: 500,
    height: 300,
    steps: 100000,
    heart_rate: 300,
    blood_pressure: 300,
    blood_sugar: 1000,
    sleep_hours: 24,
    menstruation: 28
  };

  const numValue = parseFloat(value);
  if (isNaN(numValue) || !isValidNumber(numValue, 0, maxValues[type] || 1000)) {
    return res.status(400).json({ error: `Invalid value for ${type}` });
  }

  // Validate date format
  if (date && !isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  next();
};

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const validateUserProfile = (req, res, next) => {
  const { name, mobile, age, gender, city, state, country } = req.body;
  
  // Basic validation
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Valid name required' });
  }
  
  if (age && (age < 1 || age > 120)) {
    return res.status(400).json({ error: 'Invalid age' });
  }

  // Sanitize all string inputs
  if (name) req.body.name = sanitizeString(name);
  if (mobile) req.body.mobile = sanitizeString(mobile);
  if (gender) req.body.gender = sanitizeString(gender);
  if (city) req.body.city = sanitizeString(city);
  if (state) req.body.state = sanitizeString(state);
  if (country) req.body.country = sanitizeString(country);

  next();
};

module.exports = { validateHealthRecord, validateUserProfile, isValidDate };
