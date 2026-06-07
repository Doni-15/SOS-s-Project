export function normalizeApiError(error) {
  if (error.response?.data) {
    const responseData = error.response.data;

    return {
      status: error.response.status,
      code: responseData.error?.code || responseData.code || "REQUEST_FAILED",
      message:
        responseData.error?.message ||
        responseData.message ||
        "Permintaan belum dapat diproses.",
      fields: responseData.error?.fields || responseData.fields || null,
    };
  }

  if (error.request) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "Layanan belum dapat diakses.",
      fields: null,
    };
  }

  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    message: "Terjadi kesalahan. Silakan coba lagi.",
    fields: null,
  };
}
