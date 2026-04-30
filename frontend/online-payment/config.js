// ═══════════════════════════════════════════════════════════════════════════
// API Configuration - Update this for your environment
// ═══════════════════════════════════════════════════════════════════════════

const API_CONFIG = {
  // Development
  development: 'http://localhost:3001',

  // Production - Render backend URL
  production: 'https://payment-dashboard-api.onrender.com'
};

// Detect environment (simple check - improve as needed)
const getApiBase = () => {
  const apiOverride = window.API_BASE || localStorage.getItem('API_BASE_OVERRIDE');
  if (apiOverride) {
    return apiOverride.replace(/\/$/, '');
  }

  if (window.location.protocol === 'file:') {
    return API_CONFIG.development;
  }

  // If running on localhost, use dev; otherwise use production API
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
};

const API_BASE = window.API_BASE || getApiBase();
console.log(`🔗 API Base URL: ${API_BASE}`);
