import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { systemApi } from "../api/systemApi";

export function useHealthCheck() {
  return useQuery({
    queryKey: QUERY_KEYS.system.health,
    queryFn: systemApi.getHealth,
    refetchInterval: 30000,
    retry: 1,
  });
}
