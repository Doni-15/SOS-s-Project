import axios from "axios";

import { appConfig, ROUTES } from "../constants/appConfig";
import { authStorage } from "../utils/storage";
import { normalizeApiError } from "./apiError";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = normalizeApiError(error);
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (normalizedError.status === 401 && !isLoginRequest) {
      authStorage.clearSession();

      if (window.location.pathname !== ROUTES.login) {
        window.location.assign(ROUTES.login);
      }
    }

    return Promise.reject(normalizedError);
  },
);
