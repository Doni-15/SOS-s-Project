import { useMutation, useQuery } from "@tanstack/react-query";

import { customerOrderApi } from "../api/customerOrderApi";

export const CUSTOMER_QUERY_KEYS = {
  session: (token) => ["customer", "session", token],
  menu: (token) => ["customer", "menu", token],
  tracking: (orderId) => ["customer", "tracking", orderId],
};

export function useCustomerOrderSession(token) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.session(token),
    queryFn: () => customerOrderApi.validateQrToken(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useCustomerPublicMenu(token, enabled = true) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.menu(token),
    queryFn: () => customerOrderApi.getPublicMenu(token),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useSubmitCustomerOrder() {
  return useMutation({
    mutationFn: customerOrderApi.submitOrder,
  });
}

export function useCustomerOrderTracking({
  orderId,
  orderSessionToken,
  enabled = true,
}) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.tracking(orderId),
    queryFn: () =>
      customerOrderApi.getOrderTracking({
        orderId,
        orderSessionToken,
      }),
    enabled: Boolean(orderId) && Boolean(orderSessionToken) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (["PAID", "CANCELLED", "EXPIRED"].includes(status)) {
        return false;
      }

      return 5000;
    },
    retry: false,
  });
}
