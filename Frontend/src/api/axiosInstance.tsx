import axios from "axios";
 
const baseURL =
  process.env.NODE_ENV === "production"
    ? "http://devopsinfoane.site/api/users"
    : "http://localhost:5000/api/users";
 
const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});
 
axiosInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
      const token = localStorage.getItem("accessToken");
      if (!originalRequest._retry && token) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axiosInstance.post(
            "/refresh",
            {},
            { withCredentials: true }
          );
          const newAccessToken = refreshResponse.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          return Promise.reject(refreshError);
        }
      } else {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
 
export default axiosInstance;
 