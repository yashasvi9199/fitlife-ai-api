const ALLOWED_ORIGINS = [
    'https://yashasvi9199.github.io',
    'http://yashasvi9199.github.io' // Fallback for http
];

/**
 * Handles CORS headers and preflight requests.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {boolean} - Returns true if the request was an OPTIONS request and has been handled (caller should return).
 */
function handleCors(req, res) {
    const origin = req.headers.origin;
    const allowLocalhost = process.env.ALLOW_LOCALHOST === 'true';

    let isAllowed = false;

    // Check if origin is in the allowed list
    if (ALLOWED_ORIGINS.includes(origin)) {
        isAllowed = true;
    }
    // Check for localhost if enabled
    else if (allowLocalhost && origin && origin.includes('localhost')) {
        // Strictly allow only port 5173 as requested, or allow all localhost for flexibility
        if (origin === 'http://localhost:5173') {
            isAllowed = true;
        }
    }

    // If allowed, set the specific origin. If not, we don't set the header (browser will block).
    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }

    return false;
}

module.exports = handleCors;
