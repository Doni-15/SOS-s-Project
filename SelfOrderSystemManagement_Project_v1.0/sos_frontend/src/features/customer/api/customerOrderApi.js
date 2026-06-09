import { apiClient } from "../../../shared/api/apiClient";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function unwrapOrder(response) {
  const data = unwrapApiData(response);
  return data?.order ?? data;
}

function normalizeSession(response) {
  const data = unwrapApiData(response);

  return {
    ...data,
    orderSessionId: data?.orderSession?.id ?? data?.orderSessionId,
    orderSessionToken: data?.orderSession?.token ?? data?.orderSessionToken,
    orderSessionExpiresAt:
      data?.orderSession?.expiresAt ?? data?.orderSessionExpiresAt,
    table: data?.table ?? null,
  };
}

export const customerOrderApi = {
  async validateQrToken(token) {
    const response = await apiClient.post("/public/qr/validate", { token });
    return normalizeSession(response);
  },

  async getPublicMenu(token) {
    const response = await apiClient.get("/public/menu", {
      params: { token },
    });

    return unwrapApiData(response);
  },

  async submitOrder(payload) {
    const response = await apiClient.post("/public/orders", payload);
    return unwrapOrder(response);
  },

  async getOrderTracking({ orderId, orderSessionToken }) {
    const response = await apiClient.get(`/public/orders/${orderId}`, {
      headers: {
        "x-order-session-token": orderSessionToken,
      },
    });

    return unwrapOrder(response);
  },
};
