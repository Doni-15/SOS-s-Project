import { useQuery } from "@tanstack/react-query";

import { orderApi } from "../../orders/api/orderApi";

const CASHIER_QUERY_KEYS = {
  orders: (params) => ["cashier", "orders", params],
  summary: ["cashier", "orders", "summary"],
};

export function useCashierOrders(params = {}, options = {}) {
  return useQuery({
    queryKey: CASHIER_QUERY_KEYS.orders(params),
    queryFn: () => orderApi.getOrders(params),
    staleTime: 1000 * 5,
    refetchInterval: options.refetchInterval ?? 5000,
    refetchOnWindowFocus: true,
  });
}

export function useCashierOrderSummary() {
  return useQuery({
    queryKey: CASHIER_QUERY_KEYS.summary,
    queryFn: async () => {
      const [newOrders, processingOrders, servedOrders, paidOrders] = await Promise.all([
        orderApi.getOrders({ status: "SUBMITTED", limit: 200 }),
        orderApi.getOrders({ status: "ACCEPTED", limit: 200 }),
        orderApi.getOrders({ status: "SERVED", limit: 200 }),
        orderApi.getOrders({ status: "PAID", limit: 200 }),
      ]);

      return {
        submitted: newOrders.length,
        accepted: processingOrders.length,
        served: servedOrders.length,
        paid: paidOrders.length,
      };
    },
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}
