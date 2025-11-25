// src/utils/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://employee-managements-system-e9mx.vercel.app/",
});

// Add token to every request
axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosClient;
