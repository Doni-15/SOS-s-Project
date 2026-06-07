import { apiClient } from "../../../shared/api/apiClient";
import { ORDER_ENDPOINTS } from "../constants/orderConstants";

function unwrapApiData(response) {
  return response?.data ?? response;
}

export const orderApi = {
  async getOrders(params = {}) {
    const response = await apiClient.get(ORDER_ENDPOINTS.list, { params });
    const data = unwrapApiData(response);

    return data?.orders ?? [];
  },

  async getOrderById(id) {
    const response = await apiClient.get(ORDER_ENDPOINTS.detail(id));
    const data = unwrapApiData(response);

    return data?.order ?? null;
  },

  async acceptOrder(id) {
    const response = await apiClient.patch(ORDER_ENDPOINTS.accept(id));
    const data = unwrapApiData(response);

    return data?.order ?? null;
  },

  async cancelOrder({ id, note }) {
    const response = await apiClient.patch(ORDER_ENDPOINTS.cancel(id), {
      note: note || null,
    });

    const data = unwrapApiData(response);

    return data?.order ?? null;
  },
};
