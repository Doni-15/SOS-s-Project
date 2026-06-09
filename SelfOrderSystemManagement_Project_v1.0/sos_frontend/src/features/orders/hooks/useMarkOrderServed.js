import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "../api/orderApi";
import { ORDER_QUERY_KEYS } from "../constants/orderConstants";

export function useMarkOrderServed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.markOrderServed,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });

      if (order?.id) {
        queryClient.invalidateQueries({
          queryKey: ORDER_QUERY_KEYS.detail(order.id),
        });
      }
    },
  });
}
