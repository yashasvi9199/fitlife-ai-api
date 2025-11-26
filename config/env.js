const getEnv = (primary, fallback) => {
  if (process.env[primary]) return process.env[primary];
  if (fallback && process.env[fallback]) return process.env[fallback];
  return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Define SUPABASE_URL or VITE_SUPABASE_URL in your environment.');
}

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

const cloudinaryConfig = {
  cloudName: getEnv('CLOUDINARY_CLOUD_NAME', 'VITE_CLOUDINARY_CLOUD_NAME'),
  apiKey: getEnv('CLOUDINARY_API_KEY', 'VITE_CLOUDINARY_API_KEY'),
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: getEnv('CLOUDINARY_UPLOAD_PRESET', 'VITE_CLOUDINARY_UPLOAD_PRESET'),
};

const geminiApiKey = process.env.GEMINI_API_KEY;

module.exports = {
  supabaseUrl,
  supabaseServiceRoleKey,
  supabaseAnonKey,
  cloudinaryConfig,
  geminiApiKey,
};

