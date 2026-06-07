import { useQuery } from "@tanstack/react-query";

import { orderApi } from "../api/orderApi";
import { ORDER_QUERY_KEYS } from "../constants/orderConstants";

export function useOrders(filters = {}) {
  const queryFilters = {
    status: filters.status || undefined,
    tableNumber: filters.tableNumber || undefined,
    limit: filters.limit || 50,
  };

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(queryFilters),
    queryFn: () => orderApi.getOrders(queryFilters),
    refetchInterval: filters.refetchInterval ?? 2000,
  });
}
