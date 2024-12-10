import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && 
        error.response?.data?.error === 'Token has expired') {
      // Clear the expired token
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const formattedData = {
    ...userData,
    year: parseInt(userData.year, 10)
  };
  
  const response = await api.post('/auth/register', formattedData);
  return response.data;
};

export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data.events;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/register`);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/events/${eventId}`, eventData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.enrollment_number;  
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isExternalUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    return !!decodedPayload.is_external;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

export const unregisterFromEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/unregister`);
  return response.data;
};

export const getRegisteredEvents = async () => {
  const response = await api.get('/events/registered');
  return response.data.events;
};

export const getCreatedEvents = async () => {
  const response = await api.get('/events/created');
  return response.data.events;
};

export const getEventParticipants = async (eventId) => {
  const response = await api.get(`/events/${eventId}/participants`);
  return response.data;
};

export const downloadParticipantsPDF = async (eventId, options = {}) => {
  const response = await api.get(`/events/${eventId}/participants/pdf`, {
    params: {
      fields_printed: options.fields_printed.join(',')
    },
    responseType: 'blob'
  });
  return response.data;
};

export const downloadParticipantsExcel = async (eventId, options = {}) => {
  const response = await api.get(`/events/${eventId}/participants/excel`, {
    params: {
      fields_printed: options.fields_printed.join(',')
    },
    responseType: 'blob'
  });
  return response.data;
};

export const removeParticipant = async (eventId, enrollmentNumber) => {
  const response = await api.delete(`/events/${eventId}/participants/${enrollmentNumber}`);
  return response.data;
};

export const verifyEmail = async (data) => {
  const response = await api.post('/auth/verify-email', data);
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data;
};

export const verifyEventCode = async (data) => {
  const response = await api.post('/auth/verify-event-code', data);
  return response.data;
};

export const registerExternal = async (data) => {
  const response = await api.post('/auth/register-external', data);
  return response.data;
};

export const markAttendance = async (eventId, enrollmentNumber, status) => {
  const response = await api.post(
    `/events/${eventId}/participants/${enrollmentNumber}/attendance`,
    { status }
  );
  return response.data;
};

export default api; 