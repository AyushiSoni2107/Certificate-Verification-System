const API_BASE = import.meta.env.VITE_API_URL || "";

const buildHeaders = (options) => {
  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem("token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(options),
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || "Request failed.";
    throw new Error(message);
  }
  return data;
};
