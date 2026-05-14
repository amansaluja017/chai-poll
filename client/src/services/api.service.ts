import { store } from "#/slice/config";
import axios from "axios";
import apiClient from "./apiClient.service";
import { refresh } from "#/slice/authSlice.ts";

const API_BASE_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.data.message === "TOKEN_REQUIRED" || error.response.data.message === "TokenExpiredError") {

            store.dispatch(refresh(null));

            const response = await apiClient.refresh();

            if (response.status === 200) {
                store.dispatch(refresh(response.data.data.accessToken));
                const originalRequest = error.config;
                originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                return api(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        const token = store.getState().user.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
