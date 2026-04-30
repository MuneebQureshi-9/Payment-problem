// ═══════════════════════════════════════════════════════════════════════════
// API Configuration - Update this for your environment
// ═══════════════════════════════════════════════════════════════════════════

const API_CONFIG = {
  // Development
  development: 'http://localhost:3001',
  
  // Production - Update with your Render backend URL
  production: 'https://payment-problem.onrender.com'
};

// Detect environment (simple check - improve as needed)
const getApiBase = () => {
  // If running on localhost, use dev; otherwise use production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
};

const API_BASE = getApiBase();
console.log(`🔗 API Base URL: ${API_BASE}`);
