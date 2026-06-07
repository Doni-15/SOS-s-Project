import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "../api/orderApi";
import { ORDER_QUERY_KEYS } from "../constants/orderConstants";

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
    },
  });
}
