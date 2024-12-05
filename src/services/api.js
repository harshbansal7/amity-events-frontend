import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
export const STATIC_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:5005';

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

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
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

export default api; 