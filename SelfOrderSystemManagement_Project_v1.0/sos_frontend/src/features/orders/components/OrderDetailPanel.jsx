import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { LoadingState, ErrorState } from "../../../shared/components/DataState";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { useAcceptOrder } from "../hooks/useAcceptOrder";
import { useCancelOrder } from "../hooks/useCancelOrder";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { OrderStatusBadge } from "./OrderStatusBadge";

function OrderItemRow({ item }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
        {item.quantity}x
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-950">{item.itemNameSnapshot}</p>
        <p className="mt-1 text-xs text-slate-500">
          {item.categoryNameSnapshot || "Tanpa kategori"} ·{" "}
          {formatCurrency(item.unitPriceSnapshot)}
        </p>

        {item.note ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Catatan: {item.note}
          </p>
        ) : null}
      </div>

      <p className="shrink-0 text-sm font-bold text-slate-950">
        {formatCurrency(item.subtotal)}
      </p>
    </div>
  );
}

export function OrderDetailPanel({ orderId }) {
  const detailQuery = useOrderDetail(orderId);
  const acceptOrder = useAcceptOrder();
  const cancelOrder = useCancelOrder();

  if (!orderId) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Pilih salah satu order untuk melihat detail.
        </p>
      </aside>
    );
  }

  if (detailQuery.isLoading) {
    return <LoadingState message="Memuat detail order..." />;
  }

  if (detailQuery.isError) {
    return (
      <ErrorState
        message={detailQuery.error?.message}
        onRetry={detailQuery.refetch}
        isRetrying={detailQuery.isFetching}
      />
    );
  }

  const order = detailQuery.data;

  if (!order) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Detail order tidak ditemukan.
        </p>
      </aside>
    );
  }

  const canAccept = order.status === "SUBMITTED";
  const canCancel = ["SUBMITTED", "ACCEPTED"].includes(order.status);

  const handleAccept = async () => {
    const confirmed = window.confirm(`Terima order ${order.orderNumber}?`);

    if (!confirmed) {
      return;
    }

    await acceptOrder.mutateAsync(order.id);
  };

  const handleCancel = async () => {
    const note = window.prompt(
      `Alasan pembatalan order ${order.orderNumber}`,
      "Dibatalkan oleh kasir",
    );

    if (note === null) {
      return;
    }

    await cancelOrder.mutateAsync({
      id: order.id,
      note,
    });
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Detail Order
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Meja {order.table?.tableNumber || "-"} ·{" "}
            {formatDateTime(order.createdAt || order.submittedAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {order.customerNote ? (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Catatan pelanggan: {order.customerNote}
        </div>
      ) : null}

      <div className="mt-5">
        <h3 className="text-sm font-bold text-slate-950">Item pesanan</h3>

        <div className="mt-2 divide-y divide-slate-100">
          {(order.orderItems || []).map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-600">Total tagihan</span>
          <span className="text-lg font-black text-slate-950">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={handleAccept}
          disabled={!canAccept}
          isLoading={acceptOrder.isPending}
          className="py-3 text-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          Terima Order
        </Button>

        <Button
          type="button"
          onClick={handleCancel}
          disabled={!canCancel}
          isLoading={cancelOrder.isPending}
          className="bg-red-700 py-3 text-sm hover:bg-red-800 focus:ring-red-200 disabled:bg-red-300"
        >
          <XCircle className="h-4 w-4" />
          Batalkan
        </Button>
      </div>

      {order.status === "ACCEPTED" ? (
        <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          Order sudah diterima. Tahap berikutnya adalah integrasi payment cash.
        </div>
      ) : null}
    </aside>
  );
}
