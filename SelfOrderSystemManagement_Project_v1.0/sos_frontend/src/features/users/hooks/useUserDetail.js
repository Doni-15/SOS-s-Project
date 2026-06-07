import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { userApi } from "../api/userApi";

export function useUserDetail(userId) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(userId),
    queryFn: () => userApi.getUserById(userId),
    enabled: Boolean(userId),
  });
}
