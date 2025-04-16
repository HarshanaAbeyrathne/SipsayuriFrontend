import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3600/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from localStorage if using authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // You can modify successful responses here if needed
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle different error status codes
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data || 'An error occurred';
      
      switch (status) {
        case 401:
          // Handle unauthorized
          console.error('Unauthorized:', errorMessage);
          // Clear auth data if needed
          // localStorage.removeItem('authToken');
          break;
        case 403:
          // Handle forbidden
          console.error('Forbidden:', errorMessage);
          break;
        case 404:
          // Handle not found
          console.error('Not found:', errorMessage);
          break;
        case 500:
        case 501:
        case 502:
        case 503:
          // Handle server errors
          console.error('Server error:', errorMessage);
          break;
        default:
          // Handle other errors
          console.error(`Error ${status}:`, errorMessage);
      }
    } 
    // Handle network errors
    else if (error.request) {
      console.error('Network error. Please check your connection.');
    } 
    // Handle other errors
    else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Usage example:
// import axiosInstance from './axiosConfig';
// 
// async function fetchData() {
//   try {
//     const response = await axiosInstance.get('/teachers');
//     return response.data;
//   } catch (error) {
//     // Error is already logged by interceptor
//     return null;
//   }
// }