import axios from "axios";

// Prefer VITE_API_URL when provided, default to "/api" for same-origin setups
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
