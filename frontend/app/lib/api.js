// Central API configuration
// Yahan se saari API calls hogi - URL ek jagah se manage hogi

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smart-qr-marketing-platform.onrender.com/api";

// Auth token get karna
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Authenticated API call karna
export const apiCall = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 401 - Token expired ya invalid
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export default API_BASE_URL;

