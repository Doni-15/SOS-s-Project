import { CheckCircle2, CreditCard, PackageCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { BackLink } from "../../../shared/components/BackLink";
import { Button } from "../../../shared/components/Button";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { formatDateTime } from "../../../shared/utils/formatters";
import { useAcceptOrder } from "../../orders/hooks/useAcceptOrder";
import { useCancelOrder } from "../../orders/hooks/useCancelOrder";
import { useMarkOrderServed } from "../../orders/hooks/useMarkOrderServed";
import { useOrderDetail } from "../../orders/hooks/useOrderDetail";
import { CashierOrderItemsTable } from "../components/CashierOrderItemsTable";
import { CashierOrderStatusBadge } from "../components/CashierOrderStatusBadge";
import { CashierOrderSummaryCard } from "../components/CashierOrderSummaryCard";
import { CashierShell } from "../components/CashierShell";
import {
  getCustomerNote,
  getOrderCreatedAt,
  getOrderItems,
  getOrderNumber,
  getOrderStatus,
  getOrderTransaction,
  getTableLabel,
  getTransactionId,
} from "../utils/cashierOrderHelpers";
import { ROUTES } from "../../../shared/constants/appConfig";

export function CashierOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const orderDetailQuery = useOrderDetail(orderId);
  const acceptOrder = useAcceptOrder();
  const cancelOrder = useCancelOrder();
  const markServedMutation = useMarkOrderServed();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const order = orderDetailQuery.data;
  const status = getOrderStatus(order);
  const transaction = getOrderTransaction(order);
  const isActionLoading = acceptOrder.isPending || cancelOrder.isPending || markServedMutation.isPending;

  const handleAccept = async () => {
    if (!order?.id) return;

    setActionError("");

    try {
      await acceptOrder.mutateAsync(order.id);
      await orderDetailQuery.refetch();
    } catch (error) {
      setActionError(error?.message || "Pesanan gagal diterima.");
    }
  };

  const handleCancel = async () => {
    if (!order?.id) return;

    setActionError("");

    try {
      await cancelOrder.mutateAsync(order.id);
      setCancelDialogOpen(false);
      navigate(ROUTES.cashierOrders);
    } catch (error) {
      setActionError(error?.message || "Pesanan gagal dibatalkan.");
    }
  };

  const handleMarkServed = async () => {
    if (!order?.id) return;

    setActionError("");

    try {
      await markServedMutation.mutateAsync(order.id);
      await orderDetailQuery.refetch();
    } catch (error) {
      setActionError(error?.message || "Status pesanan gagal diperbarui.");
    }
  };

  const handlePayment = () => {
    if (!order?.id) return;
    navigate(ROUTES.cashierOrderPaymentPath(order.id));
  };

  const handleOpenTransaction = () => {
    const transactionId = getTransactionId(transaction);

    if (transactionId) {
      navigate(ROUTES.cashierTransactionSuccessPath(transactionId));
    }
  };

  return (
    <CashierShell
      title="Detail Pesanan"
      description="Periksa item pesanan sebelum diproses ke pembayaran."
    >
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Batalkan pesanan?"
        description="Pesanan akan dibatalkan dan tidak bisa diproses ke pembayaran."
        cancelLabel="Kembali"
        confirmLabel="Batalkan Pesanan"
        processingLabel="Membatalkan..."
        variant="danger"
        isProcessing={cancelOrder.isPending}
        errorMessage={actionError}
        onCancel={() => {
          if (!cancelOrder.isPending) {
            setCancelDialogOpen(false);
            setActionError("");
          }
        }}
        onConfirm={handleCancel}
      />

      <div className="mb-5">
        <BackLink onClick={() => navigate(ROUTES.cashierOrders)}>
          Kembali ke daftar pesanan
        </BackLink>
      </div>

      {orderDetailQuery.isLoading ? (
        <LoadingState message="Memuat detail pesanan..." />
      ) : null}

      {orderDetailQuery.isError ? (
        <ErrorState
          title="Detail pesanan gagal dimuat"
          message={
            orderDetailQuery.error?.message ||
            "Terjadi kesalahan saat mengambil detail pesanan."
          }
          onRetry={orderDetailQuery.refetch}
          isRetrying={orderDetailQuery.isFetching}
        />
      ) : null}

      {!orderDetailQuery.isLoading && !orderDetailQuery.isError && order ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    No. Pesanan
                  </p>
                  <p className="mt-1 text-lg font-black text-blue-800">
                    {getOrderNumber(order)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Meja
                  </p>
                  <p className="mt-1 text-base font-extrabold text-slate-950">
                    {getTableLabel(order)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Waktu
                  </p>
                  <p className="mt-1 text-base font-extrabold text-slate-950">
                    {formatDateTime(getOrderCreatedAt(order))}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <div className="mt-2">
                    <CashierOrderStatusBadge status={status} />
                  </div>
                </div>
              </div>
            </section>

            <CashierOrderItemsTable items={getOrderItems(order)} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-950">
                Catatan Pelanggan
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {getCustomerNote(order) || "Tidak ada catatan pelanggan."}
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <CashierOrderSummaryCard order={order} />

            {actionError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {actionError}
              </div>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-950">
                Aksi Pesanan
              </h2>

              <div className="mt-4 space-y-3">
                {status === "SUBMITTED" ? (
                  <Button
                    type="button"
                    onClick={handleAccept}
                    isLoading={acceptOrder.isPending}
                    className="h-11 w-full text-sm font-extrabold"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Terima Pesanan
                  </Button>
                ) : null}

                {status === "ACCEPTED" ? (
                  <Button
                    type="button"
                    onClick={handleMarkServed}
                    disabled={isActionLoading || markServedMutation.isPending}
                    className="h-11 w-full text-sm font-extrabold"
                  >
                    <PackageCheck className="h-4 w-4" />
                    {markServedMutation.isPending
                      ? "Memperbarui..."
                      : "Pesanan Dihidangkan"}
                  </Button>
                ) : null}

                {status === "SERVED" ? (
                  <Button
                    type="button"
                    onClick={handlePayment}
                    disabled={isActionLoading}
                    className="h-11 w-full text-sm font-extrabold"
                  >
                    <CreditCard className="h-4 w-4" />
                    Bayar Pesanan
                  </Button>
                ) : null}

                {status === "PAID" ? (
                  <Button
                    type="button"
                    onClick={handleOpenTransaction}
                    className="h-11 w-full text-sm font-extrabold"
                  >
                    <CreditCard className="h-4 w-4" />
                    Lihat Transaksi
                  </Button>
                ) : null}

                {["SUBMITTED", "ACCEPTED"].includes(status) ? (
                  <button
                    type="button"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={isActionLoading}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Batalkan Pesanan
                  </button>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </CashierShell>
  );
}
