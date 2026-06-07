import { useQuery } from "@tanstack/react-query";

import { orderApi } from "../api/orderApi";
import { ORDER_QUERY_KEYS } from "../constants/orderConstants";

export function useOrderDetail(orderId) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: Boolean(orderId),
  });
}
