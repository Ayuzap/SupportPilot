import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  timeout: 60000,
});

// Attach JWT token from local storage to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("supportpilot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function withApiFallback(requestFn, fallbackFn) {
  try {
    const response = await requestFn(api);
    // Check if the response is actually an HTML fallback page (e.g. index.html) instead of API JSON
    const contentType = response.headers?.["content-type"] || "";
    const isHtmlString = typeof response.data === "string" && response.data.trim().startsWith("<!DOCTYPE");
    
    if (isHtmlString || contentType.includes("text/html")) {
      throw new Error("API returned HTML instead of expected JSON data");
    }
    
    return response.data;
  } catch (error) {
    return fallbackFn(error);
  }
}
