import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { transactionApi } from "../api/transactionApi";
import { ORDER_QUERY_KEYS } from "../../orders/constants/orderConstants";

export const TRANSACTION_QUERY_KEYS = {
  all: ["transactions"],
  lists: () => [...TRANSACTION_QUERY_KEYS.all, "list"],
  list: (params) => [...TRANSACTION_QUERY_KEYS.lists(), params],
  details: () => [...TRANSACTION_QUERY_KEYS.all, "detail"],
  detail: (id) => [...TRANSACTION_QUERY_KEYS.details(), id],
  receipts: () => [...TRANSACTION_QUERY_KEYS.all, "receipt"],
  receipt: (id) => [...TRANSACTION_QUERY_KEYS.receipts(), id],
};

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.list(params),
    queryFn: () => transactionApi.getTransactions(params),
  });
}

export function useTransactionDetail(transactionId) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.detail(transactionId),
    queryFn: () => transactionApi.getTransactionById(transactionId),
    enabled: Boolean(transactionId),
  });
}

export function useReceiptDetail(receiptId) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.receipt(receiptId),
    queryFn: () => transactionApi.getReceiptById(receiptId),
    enabled: Boolean(receiptId),
  });
}

export function useCreateCashPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionApi.createCashPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
    },
  });
}

export function useMarkReceiptPrintSuccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionApi.markReceiptPrintSuccess,
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.all });

      if (receipt?.id) {
        queryClient.invalidateQueries({
          queryKey: TRANSACTION_QUERY_KEYS.receipt(receipt.id),
        });
      }
    },
  });
}

export function useMarkReceiptPrintFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionApi.markReceiptPrintFailed,
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEYS.all });

      if (receipt?.id) {
        queryClient.invalidateQueries({
          queryKey: TRANSACTION_QUERY_KEYS.receipt(receipt.id),
        });
      }
    },
  });
}
