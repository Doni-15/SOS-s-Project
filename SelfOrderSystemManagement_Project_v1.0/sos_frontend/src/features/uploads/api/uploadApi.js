import { apiClient } from "../../../shared/api/apiClient";
import { API_ENDPOINTS } from "../../../shared/constants/appConfig";

function unwrapApiData(response) {
  return response?.data ?? response;
}

export const uploadApi = {
  async uploadMenuImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(API_ENDPOINTS.uploads.menuImage, formData);
    const data = unwrapApiData(response);

    return data?.image ?? data;
  },
};
