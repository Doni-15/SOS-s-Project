import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { menuApi } from "../api/menuApi";

export function useMenuItems(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.menu.items(params),
    queryFn: () => menuApi.getMenuItems(params),
  });
}
