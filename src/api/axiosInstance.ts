import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Get API base URL from environment variables
// const API_URL = "https://youtube-content-discovery-tool-be.onrender.com";
const API_URL = "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for GET requests
export const apiGet = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.get<T>(url, config);
  return response.data;
};

// Helper for POST requests
export const apiPost = async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
};

export default axiosInstance; 