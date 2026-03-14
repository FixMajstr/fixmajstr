import axios from "axios";
import Constants from "expo-constants";

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

//TODO FM-AUTH: Temporary in-memory auth store
// ReplacAT with AuthContext + expo-secure-store before merging to dev!!!
// Te variables live only for the current JS session
let _authToken = null;
let _currentUserId = null;
export const setAuthSession = (token, userId) => {
  _authToken = token;
  _currentUserId = String(userId);
};
export const clearAuthSession = () => {
  _authToken = null;
  _currentUserId = null;
};
const _authHeader = () => ({ Authorization: `Bearer ${_authToken}` });

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
    // TODO FM-AUTH: temporary- auto-save token to in-memory store until AuthContext je  wired
    if (response.data?.access_token && response.data?.user_id) {
      setAuthSession(response.data.access_token, response.data.user_id);
    }
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

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

// FM-102: Submit a new inquiry
export const submitInquiry = async ({ master_id, message }) => {
  if (!_authToken) {
    throw new Error("Ni prijavljenega uporabnika. Prijavite se najprej.");
  }
  const response = await api.post(
    "/inquiries/",
    { client_id: _currentUserId, master_id, message },
    { headers: _authHeader() },
  );
  return response.data;
};

// FM-102: Get inquiries sent by the logged-in client
export const getMyInquiries = async () => {
  const response = await api.get("/inquiries/my-inquiries", {
    headers: _authHeader(),
  });
  return response.data;
};

// FM-102: Get inquiries received by the logged-in master
export const getReceivedInquiries = async () => {
  const response = await api.get("/inquiries/received", {
    headers: _authHeader(),
  });
  return response.data;
};

// FM-102: Update inquiry status
export const updateInquiryStatus = async (inquiryId, status) => {
  const response = await api.patch(
    `/inquiries/${inquiryId}/status`,
    { status },
    { headers: _authHeader() },
  );
  return response.data;
};

export default api;
