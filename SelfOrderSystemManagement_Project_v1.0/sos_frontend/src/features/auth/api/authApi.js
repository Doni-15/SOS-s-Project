import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function normalizeLoginResponse(response) {
  const data = unwrapApiData(response);

  return {
    accessToken: data?.accessToken || data?.token || "",
    tokenType: data?.tokenType || "Bearer",
    expiresAt: data?.expiresAt || null,
    user: data?.user || null,
  };
}

export const authApi = {
  async login(payload) {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, payload);
    return normalizeLoginResponse(response);
  },

  async getMe() {
    const response = await apiClient.get(API_ENDPOINTS.auth.me);
    const data = unwrapApiData(response);
    return data?.user ?? data;
  },

  async logout() {
    const response = await apiClient.post(API_ENDPOINTS.auth.logout);
    return unwrapApiData(response);
  },
};
