import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin';

// Function to log in the admin
export const loginAdmin = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw new Error('Login failed. Please check your credentials.');
  }
};

// Function to log out the admin
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

// Function to check if the admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return token !== null;
};