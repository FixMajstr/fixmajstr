import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const getBaseUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(":").shift();
  if (host) {
    return `http://${host}:8000`;
  }
  return "http://10.0.2.2:8000";
};

const API_URL = getBaseUrl();


const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// FM-102
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const testApiConnection = async () => {
  try {
    const response = await api.get("/test/healthcheck");
    return response.data;
  } catch (error) {
    console.error("API connection failed:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.data?.access_token && response.data?.user_id) {
      await SecureStore.setItemAsync(
        "access_token",
        response.data.access_token,
      );
      await SecureStore.setItemAsync("user_id", String(response.data.user_id));
    }
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const registerUser = async (fullName, email, password) => {
  try {
    const response = await api.post("/auth/register", {
      full_name: fullName,
      email,
      password,
      role: "client",
      phone: null,
      avatar_url: null,
    });
    return response.data;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

export const registerMajstr = async (fullName, email, password) => {
  try {
    const response = await api.post("/auth/register-master", {
      full_name: fullName,
      email,
      password,
      role: "master",
      phone: null,
      avatar_url: null,
    });
    return response.data;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

export const searchMasters = async ({
  query = null,
  category = null,
  location = null,
  min_rating = null,
  limit = 20,
  offset = 0,
} = {}) => {
  try {
    const response = await api.get('/masters/search', {
      params: {
        query,
        category,
        location,
        min_rating,
        limit,
        offset,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Search masters failed:', error);
    throw error;
  }
export const getMajstrProfile = async (masterId) => {
  const response = await api.get(`/masters/${masterId}`);
  return response.data;
};


export const getMajstrRatings = async (masterId) => {
  // TODO
  throw new Error("Endpoint not implemented");
};

export const submitRating = async ({ masterId, clientId, score, comment }) => {
  // TODO
  throw new Error("Endpoint not implemented");
};

// FM-102
export const submitInquiry = async ({ master_id, message }) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (!token) {
    throw new Error("Ni prijavljenega uporabnika. Prijavite se najprej.");
  }
  const userId = await SecureStore.getItemAsync("user_id");
  const response = await api.post("/inquiries/", {
    client_id: userId,
    master_id,
    message,
  });
  return response.data;
};

// FM-102
export const getMyInquiries = async () => {
  const response = await api.get("/inquiries/my-inquiries");
  return response.data;
};

// FM-102
export const getReceivedInquiries = async () => {
  const response = await api.get("/inquiries/received");
  return response.data;
};

// FM-102
export const updateInquiryStatus = async (inquiryId, status) => {
  const response = await api.patch(`/inquiries/${inquiryId}/status`, {
    status,
  });
  return response.data;
};

export default api;
