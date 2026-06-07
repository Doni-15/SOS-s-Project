import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

export const systemApi = {
  async getHealth() {
    const response = await apiClient.get(API_ENDPOINTS.health);
    return unwrapApiData(response);
  },
};
