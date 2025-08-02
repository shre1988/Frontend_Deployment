const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://backend-deployment-nmw2.onrender.com";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  COMPONENTS: `${API_BASE_URL}/components`,
  COMPONENT_BY_ID: (id) => `${API_BASE_URL}/components/${id}`,
  INWARD_LOG: (componentId) => `${API_BASE_URL}/logs/inward/${componentId}`,
  OUTWARD_LOG: (componentId) => `${API_BASE_URL}/logs/outward/${componentId}`,
  INWARD_STATS: `${API_BASE_URL}/stats/inward`,
  OUTWARD_STATS: `${API_BASE_URL}/stats/outward`,
  ALERTS: `${API_BASE_URL}/alerts`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_USER_BY_ID: (id) => `${API_BASE_URL}/admin/users/${id}`,
};

export { API_BASE_URL };
