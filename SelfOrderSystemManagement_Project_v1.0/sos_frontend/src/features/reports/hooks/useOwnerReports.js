import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { reportApi } from "../api/reportApi";

export function useSalesSummary(params) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.salesSummary(params),
    queryFn: () => reportApi.getSalesSummary(params),
  });
}

export function useDailySales(params) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.dailySales(params),
    queryFn: () => reportApi.getDailySales(params),
  });
}

export function useTopMenuItems(params) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.topMenuItems(params),
    queryFn: () => reportApi.getTopMenuItems(params),
  });
}
