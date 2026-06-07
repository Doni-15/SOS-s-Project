import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function normalizeUserList(response) {
  const data = unwrapApiData(response);

  const users =
    data?.users ??
    data?.items ??
    data?.data ??
    (Array.isArray(data) ? data : []);

  const pagination =
    data?.pagination ??
    data?.meta ??
    {
      page: 1,
      limit: users.length,
      total: users.length,
      totalPages: 1,
    };

  return {
    users: Array.isArray(users) ? users : [],
    pagination,
  };
}

function normalizeUser(response) {
  const data = unwrapApiData(response);
  return data?.user ?? data ?? null;
}

export const userApi = {
  async getUsers(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.users.list, { params });
    return normalizeUserList(response);
  },

  async getUserById(id) {
    const response = await apiClient.get(API_ENDPOINTS.users.detail(id));
    return normalizeUser(response);
  },

  async createUser(payload) {
    const response = await apiClient.post(API_ENDPOINTS.users.list, payload);
    return normalizeUser(response);
  },

  async updateUser({ id, payload }) {
    const response = await apiClient.patch(API_ENDPOINTS.users.detail(id), payload);
    return normalizeUser(response);
  },

  async updateUserStatus({ id, isActive }) {
    const response = await apiClient.patch(API_ENDPOINTS.users.detail(id), {
      isActive,
    });

    return normalizeUser(response);
  },

  async resetUserPassword({ id, password }) {
    const response = await apiClient.patch(API_ENDPOINTS.users.password(id), {
      password,
      newPassword: password,
    });

    return normalizeUser(response);
  },
};
