import { Banknote, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { BackLink } from "../../../shared/components/BackLink";
import { Button } from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { formatCurrency } from "../../../shared/utils/formatters";
import { useOrderDetail } from "../../orders/hooks/useOrderDetail";
import { useCreateCashPayment } from "../../transactions/hooks/useTransactions";
import { CashierOrderItemsTable } from "../components/CashierOrderItemsTable";
import { CashierOrderSummaryCard } from "../components/CashierOrderSummaryCard";
import { CashierOrderStatusBadge } from "../components/CashierOrderStatusBadge";
import { CashierShell } from "../components/CashierShell";
import {
  getOrderItems,
  getOrderNumber,
  getOrderStatus,
  getOrderTotal,
  getTableLabel,
} from "../utils/cashierOrderHelpers";
import { ROUTES } from "../../../shared/constants/appConfig";

function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "") || 0);
}

export function CashierPaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const orderDetailQuery = useOrderDetail(orderId);
  const createCashPayment = useCreateCashPayment();

  const [paidAmount, setPaidAmount] = useState("");
  const [formError, setFormError] = useState("");

  const order = orderDetailQuery.data;
  const totalAmount = getOrderTotal(order);
  const numericPaidAmount = parseAmount(paidAmount);
  const changeAmount = Math.max(numericPaidAmount - totalAmount, 0);
  const status = getOrderStatus(order);

  const quickAmounts = useMemo(() => {
    if (!totalAmount) return [];

    const rounded = Math.ceil(totalAmount / 10000) * 10000;
    return Array.from(new Set([totalAmount, rounded, rounded + 10000])).filter(
      (amount) => amount >= totalAmount,
    );
  }, [totalAmount]);

  const canSubmit =
    order &&
    status === "SERVED" &&
    numericPaidAmount >= totalAmount &&
    !createCashPayment.isPending;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!order?.id) {
      setFormError("Data pesanan tidak tersedia.");
      return;
    }

    if (status !== "SERVED") {
      setFormError("Hanya pesanan berstatus dihidangkan yang bisa dibayar.");
      return;
    }

    if (numericPaidAmount < totalAmount) {
      setFormError("Nominal dibayar tidak boleh kurang dari total tagihan.");
      return;
    }

    try {
      setFormError("");

      const result = await createCashPayment.mutateAsync({
        orderId: order.id,
        payload: {
          paidAmount: numericPaidAmount,
          paymentMethod: "CASH",
        },
      });

      const transactionId = result?.transaction?.id;

      if (!transactionId) {
        navigate(ROUTES.cashierOrders);
        return;
      }

      navigate(ROUTES.cashierTransactionSuccessPath(transactionId));
    } catch (error) {
      setFormError(error?.message || "Pembayaran gagal diproses.");
    }
  };

  return (
    <CashierShell
      title="Pembayaran"
      description="Input pembayaran tunai berdasarkan total tagihan dari backend."
    >
      <div className="mb-5">
        <BackLink onClick={() => navigate(ROUTES.cashierOrderDetailPath(orderId))}>
          Kembali ke detail pesanan
        </BackLink>
      </div>

      {orderDetailQuery.isLoading ? (
        <LoadingState message="Memuat data pembayaran..." />
      ) : null}

      {orderDetailQuery.isError ? (
        <ErrorState
          title="Data pembayaran gagal dimuat"
          message={
            orderDetailQuery.error?.message ||
            "Terjadi kesalahan saat mengambil data pesanan."
          }
          onRetry={orderDetailQuery.refetch}
          isRetrying={orderDetailQuery.isFetching}
        />
      ) : null}

      {!orderDetailQuery.isLoading && !orderDetailQuery.isError && order ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]"
        >
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
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
                    Status
                  </p>
                  <div className="mt-2">
                    <CashierOrderStatusBadge status={status} />
                  </div>
                </div>
              </div>
            </section>

            <CashierOrderItemsTable items={getOrderItems(order)} />
          </div>

          <aside className="space-y-5">
            <CashierOrderSummaryCard order={order} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-950">
                Input Pembayaran
              </h2>

              {status !== "SERVED" ? (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Pesanan belum siap dibayar. Status saat ini: {status}.
                </div>
              ) : null}

              {formError ? (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="mt-5">
                <label className="text-sm font-extrabold text-slate-700">
                  Metode Pembayaran
                </label>

                <div className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 text-blue-700">
                  <Banknote className="h-5 w-5" />
                  <span className="text-sm font-extrabold">Tunai</span>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-extrabold text-slate-700">
                  Nominal Dibayar
                </label>

                <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-extrabold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={paidAmount}
                    onChange={(event) => {
                      setPaidAmount(event.target.value);
                      setFormError("");
                    }}
                    placeholder="Masukkan nominal"
                    disabled={createCashPayment.isPending}
                    className="min-w-0 flex-1 px-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {quickAmounts.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setPaidAmount(String(amount));
                        setFormError("");
                      }}
                      disabled={createCashPayment.isPending}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                  Kembalian
                </p>
                <p className="mt-1 text-xl font-extrabold text-emerald-700">
                  {formatCurrency(changeAmount)}
                </p>
              </div>

              <Button
                type="submit"
                isLoading={createCashPayment.isPending}
                disabled={!canSubmit}
                className="mt-5 h-11 w-full text-sm font-extrabold"
              >
                <Save className="h-4 w-4" />
                Simpan Transaksi
              </Button>
            </section>
          </aside>
        </form>
      ) : null}
    </CashierShell>
  );
}
