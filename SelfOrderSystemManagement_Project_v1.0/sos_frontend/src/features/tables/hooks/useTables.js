import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { tableApi } from "../api/tableApi";

export function useTables(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.tables.list(params),
    queryFn: () => tableApi.getTables(params),
  });
}

export function useTableDetail(tableId) {
  return useQuery({
    queryKey: QUERY_KEYS.tables.detail(tableId),
    queryFn: () => tableApi.getTableById(tableId),
    enabled: Boolean(tableId),
  });
}

export function useTableQrTokens(tableId, params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.tables.qrTokens(tableId, params),
    queryFn: () => tableApi.getTableQrTokens({ tableId, params }),
    enabled: Boolean(tableId),
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableApi.createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableApi.updateTable,
    onSuccess: (table) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all });

      if (table?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tables.detail(table.id),
        });
      }
    },
  });
}

export function useActivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableApi.activateTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all });
    },
  });
}

export function useDeactivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableApi.deactivateTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all });
    },
  });
}

export function useGenerateTableQrToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableApi.generateTableQrToken,
    onSuccess: (qrToken) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all });

      if (qrToken?.tableId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tables.qrTokens(qrToken.tableId, { limit: 20 }),
        });
      }
    },
  });
}

export function useRevokeQrToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableApi.revokeQrToken,
    onSuccess: (qrToken) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables.all });

      if (qrToken?.tableId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tables.qrTokens(qrToken.tableId, { limit: 20 }),
        });
      }
    },
  });
}
