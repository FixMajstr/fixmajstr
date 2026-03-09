import axios from 'axios';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':').shift();
  if (host) {
    return `http://${host}:8000`;
  }
  return 'http://10.0.2.2:8000';
};

const API_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const testApiConnection = async () => {
  try {
    const response = await api.get('/test/healthcheck');
    return response.data;
  } catch (error) {
    console.error('API connection failed:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export default api;
