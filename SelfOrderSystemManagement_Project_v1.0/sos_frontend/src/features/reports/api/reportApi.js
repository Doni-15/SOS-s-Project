import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

function unwrapReport(response) {
  const data = unwrapApiData(response);
  return data?.report ?? data ?? null;
}

export const reportApi = {
  async getSalesSummary(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.reports.salesSummary, {
      params,
    });

    return unwrapReport(response);
  },

  async getDailySales(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.reports.dailySales, {
      params,
    });

    return unwrapReport(response);
  },

  async getTopMenuItems(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.reports.topMenuItems, {
      params,
    });

    return unwrapReport(response);
  },
};
