import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store CSRF token
let csrfToken = null;

// Request interceptor
api.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token if available and not an auth route
  if (csrfToken && !config.url.startsWith("/auth/")) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Store CSRF token from response headers
    const newToken = response.headers["x-csrf-token"];
    if (newToken) {
      csrfToken = newToken;
    }
    return response;
  },
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.description?.includes("CSRF")
    ) {
      console.error("CSRF token error:", error.response.data);
    }

    // Only redirect on 401 if:
    // 1. We have a token (session expired)
    // 2. It's not a login request (login failures)
    if (
      error.response?.status === 401 &&
      localStorage.getItem("token") &&
      !error.config.url.includes("/auth/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login?expired=true";
    }
    return Promise.reject(error);
  },
);

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      return response.data;
    }
    throw new Error("No token received");
  } catch (error) {
    // Don't remove token on login failure
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  // Optionally clear other stored data
  localStorage.clear();
};

export const register = async (userData) => {
  const formattedData = {
    ...userData,
    year: parseInt(userData.year, 10),
  };

  const response = await api.post("/auth/register", formattedData);
  return response.data;
};

export const getEvents = async () => {
  const response = await api.get("/events");
  return response.data.events;
};

export const createEvent = async (eventData) => {
  try {
    // console.log("Sending event creation request:", eventData);
    const response = await api.post("/events", eventData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // console.log("Raw API response:", response);
    // Make sure we return the data object that contains approval_status
    return response.data;
  } catch (error) {
    console.error("API error in createEvent:", error);
    throw error;
  }
};

export const registerForEvent = async (eventId, data) => {
  // Set a timeout for the registration request
  const timeoutDuration = 8000; // 8 seconds
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  try {
    const response = await api.post(`/events/${eventId}/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      // Add retry logic
      retry: 1,
      retryDelay: 1000,
    });
    clearTimeout(timeoutId);
    return response.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/events/${eventId}`, eventData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Decode the JWT to check expiration
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem("token"); // Clean up expired token
      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem("token"); // Clean up invalid token
    return false;
  }
};

export const getCurrentUserId = () => {
  if (!isTokenValid()) return null;

  try {
    const token = localStorage.getItem("token");
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.enrollment_number;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getCurrentUserName = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.name;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getCurrentUserEmail = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.email;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const isExternalUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return !!decodedPayload.is_external;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

export const unregisterFromEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/unregister`);
  return response.data;
};

export const getRegisteredEvents = async () => {
  const response = await api.get("/events/registered");
  return response.data.events;
};

export const getCreatedEvents = async () => {
  const response = await api.get("/events/created");
  return response.data.events;
};

export const getEventParticipants = async (eventId) => {
  const response = await api.get(`/events/${eventId}/participants`);
  return response.data;
};

export const downloadParticipantsPDF = async (eventId, options = {}) => {
  const response = await api.get(`/events/${eventId}/participants/pdf`, {
    params: {
      fields_printed: options.fields_printed.join(","),
    },
    responseType: "blob",
  });
  return response.data;
};

export const downloadParticipantsExcel = async (eventId, options = {}) => {
  const response = await api.get(`/events/${eventId}/participants/excel`, {
    params: {
      fields_printed: options.fields_printed.join(","),
    },
    responseType: "blob",
  });
  return response.data;
};

export const removeParticipant = async (eventId, enrollmentNumber) => {
  const response = await api.delete(
    `/events/${eventId}/participants/${enrollmentNumber}`,
  );
  return response.data;
};

export const verifyEmail = async (data) => {
  const response = await api.post("/auth/verify-email", data);
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

export const verifyEventCode = async (data) => {
  const response = await api.post("/auth/verify-event-code", data);
  return response.data;
};

export const registerExternal = async (data) => {
  const response = await api.post("/auth/register-external", data);
  return response.data;
};

export const markAttendance = async (eventId, attendanceData) => {
  const response = await api.post(`/events/${eventId}/attendance`, {
    attendance: attendanceData,
  });
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const verifyResetOTP = async (data) => {
  const response = await api.post("/auth/verify-reset-otp", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export default api;
