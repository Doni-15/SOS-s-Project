import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "../constants/orderConstants";
import { useOrders } from "../hooks/useOrders";
import { OrderCard } from "./OrderCard";
import { OrderDetailPanel } from "./OrderDetailPanel";

export function OrderBoard() {
  const [selectedStatus, setSelectedStatus] = useState("SUBMITTED");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const ordersQuery = useOrders({
    status: selectedStatus,
    limit: 50,
    refetchInterval: 2000,
  });

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setSelectedOrderId(null);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">Order Board</h2>
            <p className="mt-1 text-sm text-slate-500">
              Auto refresh setiap ±2 detik sesuai baseline SDD.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => ordersQuery.refetch()}
            isLoading={ordersQuery.isFetching}
            className="w-auto px-3 py-2 text-sm shadow-none"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                selectedStatus === status
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {ordersQuery.isLoading ? (
            <LoadingState message="Memuat daftar order..." />
          ) : null}

          {ordersQuery.isError ? (
            <ErrorState
              message={ordersQuery.error?.message}
              onRetry={ordersQuery.refetch}
              isRetrying={ordersQuery.isFetching}
            />
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
            <EmptyState
              title={`Belum ada order ${ORDER_STATUS_LABELS[selectedStatus]?.toLowerCase()}`}
              description="Data kosong dari API. Empty state ini tidak menggunakan data contoh."
            />
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrderId === order.id}
                  onSelect={handleSelectOrder}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <OrderDetailPanel orderId={selectedOrderId} />
    </div>
  );
}
