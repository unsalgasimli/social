// src/lib/api.ts
import axios, {type AxiosInstance, type AxiosRequestConfig, AxiosError } from "axios";

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const publicEndpoints = ["/api/auth/login", "/api/auth/register", "/api/health"];
        const isPublic = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));
        if (!isPublic) {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;