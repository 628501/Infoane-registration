import axios from 'axios';
import { useLocation } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/users',
  withCredentials: true,
});
axiosInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(token);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401) {
      const refreshToken = getCookie('refreshToken');
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axiosInstance.post('/refresh', {}, { withCredentials: true });
          const newAccessToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed', refreshError);
          window.location.href = '/sign-in'; 
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/sign-in';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default axiosInstance;
