import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { userApi } from "../api/userApi";

export function useUsers(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: () => userApi.getUsers(params),
  });
}
