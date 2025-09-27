import axios from "axios";

// Prefer VITE_API_URL when provided, default to "http://localhost:3001/api" for development
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});