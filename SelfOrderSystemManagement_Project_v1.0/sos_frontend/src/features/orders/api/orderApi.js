import { apiClient } from "../../../shared/api/apiClient";
import { ORDER_ENDPOINTS } from "../constants/orderConstants";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function unwrapOrder(response) {
  const data = unwrapApiData(response);
  return data?.order ?? data ?? null;
}

export const orderApi = {
  async getOrders(params = {}) {
    const response = await apiClient.get(ORDER_ENDPOINTS.list, { params });
    const data = unwrapApiData(response);

    return data?.orders ?? [];
  },

  async getOrderById(id) {
    const response = await apiClient.get(ORDER_ENDPOINTS.detail(id));
    return unwrapOrder(response);
  },

  async acceptOrder(id) {
    const response = await apiClient.patch(ORDER_ENDPOINTS.accept(id));
    return unwrapOrder(response);
  },

  async markOrderServed(id) {
    const response = await apiClient.patch(ORDER_ENDPOINTS.served(id));
    return unwrapOrder(response);
  },

  async cancelOrder({ id, note }) {
    const response = await apiClient.patch(ORDER_ENDPOINTS.cancel(id), {
      note: note || null,
    });

    return unwrapOrder(response);
  },
};
