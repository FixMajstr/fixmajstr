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
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const getMajstrProfile = async (masterId) => {
  // TODO
  throw new Error("Endpoint not implemented");
};

export const getMajstrPastWork = async (masterId) => {
  // TODO
  throw new Error("Endpoint not implemented");
};

export const getMajstrRatings = async (masterId) => {
  // TODO
  throw new Error("Endpoint not implemented");
};

export const submitRating = async ({ masterId, clientId, score, comment }) => {
  // TODO
  throw new Error("Endpoint not implemented");
};

// FM-101/FM-102: Submit a new inquiry
// TODO FM-102: replace mock body with real call once auth token storage is wired:
//   const token = await AsyncStorage.getItem('access_token');
//   const res = await api.post('/inquiries/', { client_id: '...', master_id, message },
//     { headers: { Authorization: `Bearer ${token}` } });
//   return res.data;
export const submitInquiry = async ({ master_id, message }) => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          message: "Inquiry created successfully",
          inquiry: {
            id: "00000000-0000-0000-0000-000000000000",
            created_at: new Date().toISOString(),
            client_id: "00000000-0000-0000-0000-000000000000",
            master_id,
            message,
            status: "pending",
            response: null,
          },
        }),
      800,
    ),
  );
};

// FM-100: Get inquiries sent by the logged-in client
// TODO FM-102: replace mock with real call once auth is wired:
//   api.get('/inquiries/my-inquiries', { headers: { Authorization: `Bearer ${token}` } })
export const getMyInquiries = async () => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          inquiries: [
            {
              id: "inq-1",
              master_id: "mock-uuid",
              message: "Pipa v kopalnici pušča in voda teče po tleh.",
              status: "pending",
              created_at: "2026-03-10T10:00:00Z",
            },
            {
              id: "inq-2",
              master_id: "mock-uuid",
              message: "Električni kvart na hodniku, luč ne dela.",
              status: "accepted",
              created_at: "2026-03-08T14:00:00Z",
            },
            {
              id: "inq-3",
              master_id: "mock-uuid",
              message: "Potrebujem montažo umivalnika v kopalnici.",
              status: "rejected",
              created_at: "2026-03-05T09:00:00Z",
            },
          ],
          total: 3,
        }),
      600,
    ),
  );
};

// FM-100: Get inquiries received by the logged-in master
// TODO FM-102: replace mock with real call once auth is wired:
//   api.get('/inquiries/received', { headers: { Authorization: `Bearer ${token}` } })
export const getReceivedInquiries = async () => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          inquiries: [
            {
              id: "inq-4",
              client_id: "mock-client-1",
              message: "Pipa v kopalnici pušča in voda teče po tleh.",
              status: "pending",
              created_at: "2026-03-10T10:00:00Z",
            },
            {
              id: "inq-5",
              client_id: "mock-client-2",
              message: "Električni kvart na hodniku, luč ne dela.",
              status: "accepted",
              created_at: "2026-03-08T14:00:00Z",
            },
            {
              id: "inq-6",
              client_id: "mock-client-3",
              message: "Zamenjava bojlerja — star ne greje.",
              status: "rejected",
              created_at: "2026-03-04T08:00:00Z",
            },
          ],
          total: 3,
        }),
      600,
    ),
  );
};

// FM-100: Update inquiry status (master accepts or rejects)
// TODO FM-102: replace mock with real call once auth is wired:
//   api.patch(`/inquiries/${inquiryId}/status`, { status },
//     { headers: { Authorization: `Bearer ${token}` } })
export const updateInquiryStatus = async (inquiryId, status) => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          message: "Inquiry status updated successfully",
          inquiry: { id: inquiryId, status },
        }),
      400,
    ),
  );
};

export default api;
