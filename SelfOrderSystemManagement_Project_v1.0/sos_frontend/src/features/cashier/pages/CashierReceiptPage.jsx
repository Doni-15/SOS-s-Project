import { ClipboardList, Printer, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { BackLink } from "../../../shared/components/BackLink";
import { Button } from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { ROUTES } from "../../../shared/constants/appConfig";
import {
  useMarkReceiptPrintFailed,
  useMarkReceiptPrintSuccess,
  useReceiptDetail,
  useTransactionDetail,
} from "../../transactions/hooks/useTransactions";
import { CashierReceiptPreview } from "../components/CashierReceiptPreview";
import { CashierShell } from "../components/CashierShell";
import {
  getReceiptId,
  getReceiptPrintCount,
  getReceiptStatus,
} from "../utils/cashierOrderHelpers";

export function CashierReceiptPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const transactionQuery = useTransactionDetail(transactionId);
  const transaction = transactionQuery.data;
  const receiptId = getReceiptId(transaction);

  const receiptQuery = useReceiptDetail(receiptId);
  const markPrintSuccess = useMarkReceiptPrintSuccess();
  const markPrintFailed = useMarkReceiptPrintFailed();

  const receipt = receiptQuery.data ?? transaction?.receipt ?? null;
  const isLoading = transactionQuery.isLoading || (receiptId && receiptQuery.isLoading);
  const isError = transactionQuery.isError || receiptQuery.isError;
  const isPrinting = markPrintSuccess.isPending || markPrintFailed.isPending;

  const handlePrint = async () => {
    if (!receiptId) {
      return;
    }

    try {
      window.print();
      await markPrintSuccess.mutateAsync(receiptId);
    } catch (error) {
      await markPrintFailed.mutateAsync({
        receiptId,
        errorMessage: error?.message || "Print receipt failed from browser.",
      });
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      transactionQuery.refetch(),
      receiptId ? receiptQuery.refetch() : Promise.resolve(),
    ]);
  };

  return (
    <CashierShell
      title="Struk Pembayaran"
      description="Pratinjau dan cetak struk transaksi kasir."
      headerAction={
        <Button
          type="button"
          onClick={handleRefresh}
          isLoading={transactionQuery.isFetching || receiptQuery.isFetching}
          className="h-10 w-auto px-4 text-sm font-extrabold print:hidden"
        >
          <RotateCcw className="h-4 w-4" />
          Muat Ulang
        </Button>
      }
    >
      <div className="mb-5 print:hidden">
        <BackLink
          onClick={() =>
            navigate(ROUTES.cashierTransactionSuccessPath(transactionId))
          }
        >
          Kembali ke ringkasan transaksi
        </BackLink>
      </div>

      {isLoading ? <LoadingState message="Memuat struk pembayaran..." /> : null}

      {isError ? (
        <ErrorState
          title="Struk gagal dimuat"
          message={
            transactionQuery.error?.message ||
            receiptQuery.error?.message ||
            "Terjadi kesalahan saat mengambil data struk."
          }
          onRetry={handleRefresh}
          isRetrying={transactionQuery.isFetching || receiptQuery.isFetching}
        />
      ) : null}

      {!isLoading && !isError && transaction ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] print:block">
          <CashierReceiptPreview transaction={transaction} receipt={receipt} />

          <aside className="space-y-5 print:hidden">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-950">
                Aksi Struk
              </h2>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Status Print</span>
                    <span className="font-extrabold text-slate-950">
                      {getReceiptStatus(receipt)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-slate-500">Jumlah Cetak</span>
                    <span className="font-extrabold text-slate-950">
                      {getReceiptPrintCount(receipt)}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handlePrint}
                  disabled={!receiptId}
                  isLoading={isPrinting}
                  className="h-11 w-full text-sm font-extrabold"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Struk
                </Button>

                <button
                  type="button"
                  onClick={() => navigate(ROUTES.cashierOrders)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
                >
                  <ClipboardList className="h-4 w-4" />
                  Kembali ke Pesanan
                </button>
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </CashierShell>
  );
}
