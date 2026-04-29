// ═══════════════════════════════════════════════════════════════════════════
// API Configuration - Update this for your environment
// ═══════════════════════════════════════════════════════════════════════════

const API_CONFIG = {
  // Development
  development: 'http://localhost:3001',

  // Production - same origin when served by the backend
  production: window.location.origin
};

// Detect environment (simple check - improve as needed)
const getApiBase = () => {
  if (window.location.protocol === 'file:') {
    return API_CONFIG.development;
  }

  // If running on localhost, use dev; otherwise use the current origin
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
};

const API_BASE = window.API_BASE || getApiBase();
console.log(`🔗 API Base URL: ${API_BASE}`);
