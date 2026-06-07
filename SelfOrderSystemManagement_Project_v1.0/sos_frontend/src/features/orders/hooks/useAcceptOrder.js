import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "../api/orderApi";
import { ORDER_QUERY_KEYS } from "../constants/orderConstants";

export function useAcceptOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.acceptOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
    },
  });
}
