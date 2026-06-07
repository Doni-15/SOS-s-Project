import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { menuApi } from "../api/menuApi";

export function useMenuCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.menu.categories(),
    queryFn: menuApi.getCategories,
  });
}
