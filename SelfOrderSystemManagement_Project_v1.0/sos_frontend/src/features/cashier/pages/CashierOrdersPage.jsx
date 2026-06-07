import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "../../../shared/components/Button";
import { ROUTES } from "../../../shared/constants/appConfig";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { EmptyState } from "../../../shared/components/EmptyState";
import {
  formatCurrency,
  formatDateTime,
  formatShortTime,
} from "../../../shared/utils/formatters";
import { useAcceptOrder } from "../../orders/hooks/useAcceptOrder";
import { CashierShell } from "../components/CashierShell";
import { CashierOrderStatusBadge } from "../components/CashierOrderStatusBadge";
import {
  CASHIER_ORDER_STATUSES,
  CASHIER_ORDER_STATUS_LABELS,
  filterOrdersByKeyword,
  getAcceptedByName,
  getCustomerNote,
  getOrderCreatedAt,
  getOrderItemName,
  getOrderItemQuantity,
  getOrderItems,
  getOrderNumber,
  getOrderStatus,
  getOrderTotal,
  getTableLabel,
  sortOrdersByTime,
} from "../utils/cashierOrderHelpers";
import { useCashierOrders } from "../hooks/useCashierOrders";

const ORDER_LIMIT = 100;

function QuickOrderPanel({ order, onAccept, isAccepting }) {
  if (!order) {
    return null;
  }

  const status = getOrderStatus(order);
  const items = getOrderItems(order);

  return (
    <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Detail Pesanan
          </h2>
          <p className="mt-1 text-sm font-semibold text-blue-700">
            {getOrderNumber(order)}
          </p>
        </div>

        <CashierOrderStatusBadge status={status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-500">Meja</p>
          <p className="mt-1 text-sm font-extrabold text-slate-950">
            {getTableLabel(order)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-500">Ditangani</p>
          <p className="mt-1 text-sm font-extrabold text-slate-950">
            {getAcceptedByName(order)}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3">
        <p className="text-xs font-bold text-slate-500">Waktu Pesanan</p>
        <p className="mt-1 text-sm font-extrabold text-slate-950">
          {formatDateTime(getOrderCreatedAt(order))}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-extrabold text-slate-950">Item Pesanan</p>
        </div>

        <div className="divide-y divide-slate-100">
          {items.length ? (
            items.slice(0, 6).map((item) => (
              <div
                key={item.id ?? `${getOrderItemName(item)}-${getOrderItemQuantity(item)}`}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {getOrderItemName(item)}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Qty {getOrderItemQuantity(item)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-4 text-sm font-semibold text-slate-500">
              Item pesanan tidak tersedia.
            </p>
          )}
        </div>
      </div>

      {getCustomerNote(order) ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="text-xs font-extrabold text-amber-700">
            Catatan Pelanggan
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            {getCustomerNote(order)}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-blue-50 p-4">
        <p className="text-sm font-extrabold text-blue-900">Total</p>
        <p className="text-lg font-extrabold text-blue-700">
          {formatCurrency(getOrderTotal(order))}
        </p>
      </div>

      {status === "SUBMITTED" ? (
        <Button
          type="button"
          onClick={() => onAccept(order)}
          isLoading={isAccepting}
          className="mt-4 h-11 w-full text-sm font-extrabold"
        >
          <CheckCircle2 className="h-4 w-4" />
          Terima Pesanan
        </Button>
      ) : null}
    </aside>
  );
}

export function CashierOrdersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "SUBMITTED",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [acceptingOrderId, setAcceptingOrderId] = useState("");
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const queryParams = useMemo(
    () => ({
      status: filters.status || undefined,
      limit: ORDER_LIMIT,
    }),
    [filters.status],
  );

  const ordersQuery = useCashierOrders(queryParams, {
    refetchInterval: 5000,
  });
  const acceptOrder = useAcceptOrder();

  const sortedOrders = useMemo(
    () => sortOrdersByTime(ordersQuery.data ?? []),
    [ordersQuery.data],
  );

  const visibleOrders = useMemo(
    () => filterOrdersByKeyword(sortedOrders, filters.search),
    [sortedOrders, filters.search],
  );

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setSelectedOrder(null);
  };

  const handleOpenDetail = (order) => {
    if (order?.id) {
      navigate(ROUTES.cashierOrderDetailPath(order.id));
    }
  };

  const handleRefresh = async () => {
    setIsManualRefreshing(true);

    try {
      await ordersQuery.refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleAcceptOrder = async (order) => {
    if (!order?.id) {
      return;
    }

    setAcceptingOrderId(order.id);

    try {
      const acceptedOrder = await acceptOrder.mutateAsync(order.id);
      setSelectedOrder(acceptedOrder ?? order);
      await handleRefresh();
    } finally {
      setAcceptingOrderId("");
    }
  };

  const isLoading = ordersQuery.isLoading;
  const isError = ordersQuery.isError;
  const selectedOrderStillVisible = visibleOrders.find(
    (order) => order.id === selectedOrder?.id,
  );
  const activeSelectedOrder = selectedOrderStillVisible ?? selectedOrder;

  return (
    <CashierShell
      title="Pesanan Kasir"
      description="Pantau pesanan masuk dan proses order kasir."
      headerAction={
        <Button
          type="button"
          onClick={handleRefresh}
          isLoading={isManualRefreshing}
          className="h-10 w-auto px-4 text-sm font-extrabold"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Ulang
        </Button>
      }
    >
      <div
        className={
          activeSelectedOrder
            ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
            : "grid gap-5"
        }
      >
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Daftar Pesanan Masuk
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pesanan baru akan muncul otomatis saat tersedia.
                </p>
              </div>

              <div className="flex rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                {visibleOrders.length} pesanan tampil
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
              <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={filters.search}
                  onChange={handleFilterChange("search")}
                  placeholder="Cari nomor pesanan, meja, atau item..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={filters.status}
                onChange={handleFilterChange("status")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Semua Status</option>
                {CASHIER_ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CASHIER_ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-5">
              <LoadingState message="Memuat daftar pesanan..." />
            </div>
          ) : null}

          {isError ? (
            <div className="p-5">
              <ErrorState
                title="Pesanan gagal dimuat"
                message={
                  ordersQuery.error?.message ||
                  "Terjadi kesalahan saat mengambil data pesanan."
                }
                onRetry={handleRefresh}
                isRetrying={isManualRefreshing}
              />
            </div>
          ) : null}

          {!isLoading && !isError && !visibleOrders.length ? (
            <div className="p-5">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10">
                <EmptyState
                  title="Belum ada pesanan"
                  description="Tidak ada pesanan yang cocok dengan filter saat ini."
                />
              </div>
            </div>
          ) : null}

          {!isLoading && !isError && visibleOrders.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-extrabold">No. Pesanan</th>
                    <th className="px-5 py-3 font-extrabold">Meja</th>
                    <th className="px-5 py-3 font-extrabold">Waktu</th>
                    <th className="px-5 py-3 font-extrabold">Status</th>
                    <th className="px-5 py-3 font-extrabold">Total</th>
                    <th className="px-5 py-3 font-extrabold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {visibleOrders.map((order) => {
                    const status = getOrderStatus(order);
                    const isSelected = activeSelectedOrder?.id === order.id;
                    const isAccepting = acceptingOrderId === order.id;

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={
                          isSelected
                            ? "cursor-pointer bg-blue-50/70 transition hover:bg-blue-50"
                            : "cursor-pointer transition hover:bg-slate-50"
                        }
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-extrabold text-blue-800">
                            {getOrderNumber(order)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {getOrderItems(order).length} item
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                          {getTableLabel(order)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatShortTime(getOrderCreatedAt(order))}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <CashierOrderStatusBadge status={status} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-extrabold text-slate-950">
                          {formatCurrency(getOrderTotal(order))}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenDetail(order);
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                            >
                              Detail
                            </button>

                            {status === "SUBMITTED" ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleAcceptOrder(order);
                                }}
                                disabled={acceptOrder.isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isAccepting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                Terima
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <QuickOrderPanel
          order={activeSelectedOrder}
          onAccept={handleAcceptOrder}
          isAccepting={Boolean(
            activeSelectedOrder?.id && acceptingOrderId === activeSelectedOrder.id,
          )}
        />
      </div>
    </CashierShell>
  );
}
