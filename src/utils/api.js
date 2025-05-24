/**
 * API utility functions for making requests to the backend
 */

// In development, we use the proxy defined in vite.config.js
// In production, we use the environment variable
const isDevelopment = import.meta.env.DEV;
export const API_BASE_URL = isDevelopment ? '/api' : import.meta.env.VITE_API_BASE_URL;

/**
 * Get the full API URL for a specific endpoint
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} The full API URL
 */
export const getApiUrl = (endpoint) => {
  // Make sure the endpoint doesn't start with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // For development, use the proxy which is already configured to point to /api
  if (import.meta.env.DEV) {
    return `/api/${cleanEndpoint}`;
  }
  
  // For production, use the full URL from environment variables
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Get authentication headers with Firebase token
 * @param {string} token - Firebase ID token
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {string} token - Firebase ID token
 * @returns {Promise} Fetch promise
 */
export const fetchWithAuth = async (endpoint, options = {}, token) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const headers = {
    ...options.headers,
    ...getAuthHeaders(token)
  };

  return fetch(getApiUrl(endpoint), {
    ...options,
    headers
  });
};
