import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function normalizeCategories(response) {
  const data = unwrapApiData(response);
  return data?.categories ?? data?.items ?? data?.data ?? data ?? [];
}

function normalizeCategory(response) {
  const data = unwrapApiData(response);
  return data?.category ?? data?.item ?? data?.data ?? data ?? null;
}

function normalizeMenuItems(response) {
  const data = unwrapApiData(response);

  const menuItems =
    data?.menuItems ??
    data?.items ??
    data?.data ??
    (Array.isArray(data) ? data : []);

  const pagination =
    data?.pagination ??
    data?.meta ??
    {
      page: 1,
      limit: menuItems.length,
      total: menuItems.length,
      totalPages: 1,
    };

  return {
    menuItems: Array.isArray(menuItems) ? menuItems : [],
    pagination,
  };
}

function normalizeMenuItem(response) {
  const data = unwrapApiData(response);
  return data?.menuItem ?? data?.item ?? data?.data ?? data ?? null;
}

export const menuApi = {
  async getCategories() {
    const response = await apiClient.get(API_ENDPOINTS.menu.categories);
    return normalizeCategories(response);
  },

  async createCategory(payload) {
    const response = await apiClient.post(API_ENDPOINTS.menu.categories, payload);
    return normalizeCategory(response);
  },

  async getMenuItems(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.menu.items, { params });
    return normalizeMenuItems(response);
  },

  async createMenuItem(payload) {
    const response = await apiClient.post(API_ENDPOINTS.menu.items, payload);
    return normalizeMenuItem(response);
  },

  async updateMenuItem({ id, payload }) {
    const response = await apiClient.patch(API_ENDPOINTS.menu.itemDetail(id), payload);
    return normalizeMenuItem(response);
  },

  async deleteMenuItem(id) {
    const response = await apiClient.delete(API_ENDPOINTS.menu.itemDetail(id));
    return unwrapApiData(response);
  },
};
