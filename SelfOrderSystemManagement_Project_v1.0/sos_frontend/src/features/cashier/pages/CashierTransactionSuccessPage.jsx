import { CheckCircle2, ClipboardList, ReceiptText } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { useTransactionDetail } from "../../transactions/hooks/useTransactions";
import { CashierShell } from "../components/CashierShell";
import {
  getReceiptId,
  getTableLabel,
  getTransactionChangeAmount,
  getTransactionNumber,
  getTransactionPaidAmount,
  getTransactionTime,
} from "../utils/cashierOrderHelpers";
import { ROUTES } from "../../../shared/constants/appConfig";

export function CashierTransactionSuccessPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const transactionQuery = useTransactionDetail(transactionId);
  const transaction = transactionQuery.data;
  const order = transaction?.order;

  return (
    <CashierShell
      title="Transaksi Berhasil"
      description="Pembayaran berhasil diproses oleh sistem."
    >
      {transactionQuery.isLoading ? (
        <LoadingState message="Memuat ringkasan transaksi..." />
      ) : null}

      {transactionQuery.isError ? (
        <ErrorState
          title="Transaksi gagal dimuat"
          message={
            transactionQuery.error?.message ||
            "Terjadi kesalahan saat mengambil data transaksi."
          }
          onRetry={transactionQuery.refetch}
          isRetrying={transactionQuery.isFetching}
        />
      ) : null}

      {!transactionQuery.isLoading && !transactionQuery.isError && transaction ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="mt-5 text-xl font-extrabold text-emerald-700">
            Transaksi Berhasil
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Pembayaran telah tersimpan dan order sudah berstatus lunas.
          </p>

          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 text-left">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-extrabold text-slate-950">
                Ringkasan Transaksi
              </h3>
            </div>

            <div className="space-y-3 px-5 py-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nomor Transaksi</span>
                <span className="font-extrabold text-blue-700">
                  {getTransactionNumber(transaction)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nomor Order</span>
                <span className="font-extrabold text-slate-800">
                  {order?.orderNumber ?? "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Meja</span>
                <span className="font-extrabold text-slate-800">
                  {getTableLabel(order)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Total</span>
                <span className="font-extrabold text-slate-800">
                  {formatCurrency(transaction.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Dibayar</span>
                <span className="font-extrabold text-slate-800">
                  {formatCurrency(getTransactionPaidAmount(transaction))}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
                <span className="font-extrabold text-slate-950">Kembalian</span>
                <span className="font-extrabold text-emerald-700">
                  {formatCurrency(getTransactionChangeAmount(transaction))}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Waktu</span>
                <span className="font-extrabold text-slate-800">
                  {formatDateTime(getTransactionTime(transaction))}
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => navigate(ROUTES.cashierOrders)}
              className="h-11 flex-1 text-sm font-extrabold"
            >
              <ClipboardList className="h-4 w-4" />
              Kembali ke Pesanan
            </Button>

            <button
              type="button"
              onClick={() =>
                navigate(ROUTES.cashierTransactionReceiptPath(transactionId))
              }
              disabled={!getReceiptId(transaction)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ReceiptText className="h-4 w-4" />
              Lihat Struk
            </button>
          </div>
        </section>
      ) : null}
    </CashierShell>
  );
}
