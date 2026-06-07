import { apiClient } from "../../../shared/api/apiClient";

const TRANSACTION_ENDPOINTS = {
  list: "/internal/transactions",
  detail: (id) => `/internal/transactions/${id}`,
  payOrder: (orderId) => `/internal/orders/${orderId}/payments`,
  receiptDetail: (receiptId) => `/internal/receipts/${receiptId}`,
  receiptPrintSuccess: (receiptId) => `/internal/receipts/${receiptId}/print-success`,
  receiptPrintFailed: (receiptId) => `/internal/receipts/${receiptId}/print-failed`,
};

function unwrapApiData(response) {
  return response?.data ?? response;
}

function normalizeTransactionList(response) {
  const data = unwrapApiData(response);

  const transactions =
    data?.transactions ??
    data?.items ??
    data?.data ??
    (Array.isArray(data) ? data : []);

  const pagination =
    data?.pagination ??
    data?.meta ??
    {
      page: 1,
      limit: transactions.length,
      total: transactions.length,
      totalPages: 1,
    };

  return {
    transactions: Array.isArray(transactions) ? transactions : [],
    pagination,
  };
}

function normalizePaymentResult(response) {
  const data = unwrapApiData(response);

  return {
    transaction: data?.transaction ?? data?.data?.transaction ?? null,
    receipt: data?.receipt ?? data?.data?.receipt ?? null,
  };
}

export const transactionApi = {
  async getTransactions(params = {}) {
    const response = await apiClient.get(TRANSACTION_ENDPOINTS.list, { params });
    return normalizeTransactionList(response);
  },

  async getTransactionById(id) {
    const response = await apiClient.get(TRANSACTION_ENDPOINTS.detail(id));
    const data = unwrapApiData(response);

    return data?.transaction ?? data ?? null;
  },

  async createCashPayment({ orderId, payload }) {
    const response = await apiClient.post(
      TRANSACTION_ENDPOINTS.payOrder(orderId),
      {
        paymentMethod: "CASH",
        ...payload,
      },
    );

    return normalizePaymentResult(response);
  },

  async getReceiptById(receiptId) {
    const response = await apiClient.get(
      TRANSACTION_ENDPOINTS.receiptDetail(receiptId),
    );
    const data = unwrapApiData(response);

    return data?.receipt ?? data ?? null;
  },

  async markReceiptPrintSuccess(receiptId) {
    const response = await apiClient.patch(
      TRANSACTION_ENDPOINTS.receiptPrintSuccess(receiptId),
    );
    const data = unwrapApiData(response);

    return data?.receipt ?? data ?? null;
  },

  async markReceiptPrintFailed({ receiptId, errorMessage }) {
    const response = await apiClient.patch(
      TRANSACTION_ENDPOINTS.receiptPrintFailed(receiptId),
      {
        errorMessage,
      },
    );
    const data = unwrapApiData(response);

    return data?.receipt ?? data ?? null;
  },
};
