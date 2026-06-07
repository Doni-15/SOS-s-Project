import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function normalizeTableList(response) {
  const data = unwrapApiData(response);

  const tables =
    data?.tables ??
    data?.items ??
    data?.data ??
    (Array.isArray(data) ? data : []);

  return {
    tables,
    pagination:
      data?.pagination ??
      data?.meta ?? {
        page: 1,
        limit: tables.length,
        total: tables.length,
        totalPages: 1,
      },
  };
}

function normalizeTable(response) {
  const data = unwrapApiData(response);

  return data?.table ?? data;
}

function normalizeQrTokenList(response) {
  const data = unwrapApiData(response);

  return data?.qrTokens ?? data?.items ?? data?.data ?? (Array.isArray(data) ? data : []);
}

function normalizeQrToken(response) {
  const data = unwrapApiData(response);

  return data?.qrToken ?? data;
}

export const tableApi = {
  async getTables(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.tables.list, { params });

    return normalizeTableList(response);
  },

  async getTableById(id) {
    const response = await apiClient.get(API_ENDPOINTS.tables.detail(id));

    return normalizeTable(response);
  },

  async createTable(payload) {
    const response = await apiClient.post(API_ENDPOINTS.tables.list, payload);

    return normalizeTable(response);
  },

  async updateTable({ id, payload }) {
    const response = await apiClient.patch(API_ENDPOINTS.tables.detail(id), payload);

    return normalizeTable(response);
  },

  async activateTable(id) {
    const response = await apiClient.patch(API_ENDPOINTS.tables.activate(id));

    return normalizeTable(response);
  },

  async deactivateTable(id) {
    const response = await apiClient.patch(API_ENDPOINTS.tables.deactivate(id));

    return normalizeTable(response);
  },

  async getTableQrTokens({ tableId, params = {} }) {
    const response = await apiClient.get(API_ENDPOINTS.tables.qrTokens(tableId), {
      params,
    });

    return normalizeQrTokenList(response);
  },

  async generateTableQrToken({ tableId, payload }) {
    const response = await apiClient.post(
      API_ENDPOINTS.tables.qrTokens(tableId),
      payload,
    );

    return normalizeQrToken(response);
  },

  async revokeQrToken(qrTokenId) {
    const response = await apiClient.patch(
      API_ENDPOINTS.tables.revokeQrToken(qrTokenId),
    );

    return normalizeQrToken(response);
  },
};
