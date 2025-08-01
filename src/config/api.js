// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Component endpoints
  COMPONENTS: `${API_BASE_URL}/components`,
  COMPONENT_BY_ID: (id) => `${API_BASE_URL}/components/${id}`,
  
  // Log endpoints
  INWARD_LOG: (componentId) => `${API_BASE_URL}/logs/inward/${componentId}`,
  OUTWARD_LOG: (componentId) => `${API_BASE_URL}/logs/outward/${componentId}`,
  
  // Stats endpoints
  INWARD_STATS: `${API_BASE_URL}/stats/inward`,
  OUTWARD_STATS: `${API_BASE_URL}/stats/outward`,
  
  // Alerts endpoint
  ALERTS: `${API_BASE_URL}/alerts`,
};

export default API_BASE_URL; 