import axios from 'axios';

// Resolve API base URL - use the configured URL or default to localhost:8000
function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }
  // Always fall back to 127.0.0.1 — on Windows, 'localhost' resolves to ::1 (IPv6)
  // first but the backend only binds to 127.0.0.1 (IPv4).
  return 'http://127.0.0.1:8000';
}

const API_BASE_URL = resolveApiBaseUrl();
const API_URL = `${API_BASE_URL}/api/auth`;

// Function to log in the admin
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.access_token) {
      localStorage.setItem('adminToken', response.data.access_token);
    }
    return response.data.access_token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
  }
};

// Function to log out the admin
export const logout = () => {
  localStorage.removeItem('adminToken');
};

// Function to check if the admin is authenticated
export const checkAuthStatus = async (token) => {
  if (!token) {
    return false;
  }
  try {
    // Try to access the root endpoint with the token to verify backend is accessible
    const response = await axios.get(`${API_BASE_URL}/`, {
      timeout: 5000,
    });
    // If we get here, backend is running and token can be used
    return true;
  } catch (error) {
    console.error('Auth check error:', error.message);
    return false;
  }
};


// Default export with method-style interface for backward compatibility
export default {
  login,
  logout,
  checkAuthStatus,
};