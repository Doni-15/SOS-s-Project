import { Eye, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { EmptyState } from "../../../shared/components/EmptyState";
import { ROUTES } from "../../../shared/constants/appConfig";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { useTransactions } from "../../transactions/hooks/useTransactions";
import { CashierShell } from "../components/CashierShell";
import {
  getOrderNumber,
  getTableLabel,
  getTransactionChangeAmount,
  getTransactionNumber,
  getTransactionPaidAmount,
  getTransactionTime,
} from "../utils/cashierOrderHelpers";

function getTransactionOrder(transaction) {
  return transaction?.order ?? null;
}

function getTransactionTotal(transaction) {
  return Number(transaction?.totalAmount ?? transaction?.total_amount ?? 0);
}

function getTransactionPaymentMethod(transaction) {
  return transaction?.paymentMethod ?? transaction?.payment_method ?? "CASH";
}

function getTransactionSearchText(transaction) {
  const order = getTransactionOrder(transaction);

  return [
    getTransactionNumber(transaction),
    getOrderNumber(order),
    getTableLabel(order),
    getTransactionPaymentMethod(transaction),
    transaction?.cashier?.fullName,
    transaction?.cashier?.username,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function CashierTransactionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const transactionsQuery = useTransactions({
    limit: 100,
  });

  const transactions = useMemo(
    () => transactionsQuery.data?.transactions ?? [],
    [transactionsQuery.data],
  );

  const visibleTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      getTransactionSearchText(transaction).includes(keyword),
    );
  }, [search, transactions]);

  const handleOpenTransaction = (transaction) => {
    if (!transaction?.id) {
      return;
    }

    navigate(ROUTES.cashierTransactionSuccessPath(transaction.id));
  };

  return (
    <CashierShell
      badge="Kasir"
      title="Transaksi Kasir"
      description="Lihat riwayat transaksi yang sudah diproses dari backend."
      headerAction={
        <Button
          type="button"
          onClick={() => transactionsQuery.refetch()}
          isLoading={transactionsQuery.isFetching}
          className="h-10 w-auto px-4 text-sm font-extrabold"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Ulang
        </Button>
      }
    >
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                Daftar Transaksi
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Semua data transaksi diambil langsung dari backend.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
              {visibleTransactions.length} transaksi tampil
            </div>
          </div>

          <label className="mt-5 flex h-11 max-w-xl items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari transaksi, order, meja, atau metode..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {transactionsQuery.isLoading ? (
          <div className="p-5">
            <LoadingState message="Memuat transaksi..." />
          </div>
        ) : null}

        {transactionsQuery.isError ? (
          <div className="p-5">
            <ErrorState
              title="Transaksi gagal dimuat"
              message={
                transactionsQuery.error?.message ||
                "Terjadi kesalahan saat mengambil data transaksi."
              }
              onRetry={transactionsQuery.refetch}
              isRetrying={transactionsQuery.isFetching}
            />
          </div>
        ) : null}

        {!transactionsQuery.isLoading &&
        !transactionsQuery.isError &&
        !visibleTransactions.length ? (
          <div className="p-5">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10">
              <EmptyState
                title="Belum ada transaksi"
                description="Tidak ada transaksi yang cocok dengan pencarian saat ini."
              />
            </div>
          </div>
        ) : null}

        {!transactionsQuery.isLoading &&
        !transactionsQuery.isError &&
        visibleTransactions.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-extrabold">Transaksi</th>
                  <th className="px-5 py-3 font-extrabold">Order</th>
                  <th className="px-5 py-3 font-extrabold">Meja</th>
                  <th className="px-5 py-3 font-extrabold">Metode</th>
                  <th className="px-5 py-3 font-extrabold">Total</th>
                  <th className="px-5 py-3 font-extrabold">Dibayar</th>
                  <th className="px-5 py-3 font-extrabold">Kembalian</th>
                  <th className="px-5 py-3 font-extrabold">Waktu</th>
                  <th className="px-5 py-3 font-extrabold">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleTransactions.map((transaction) => {
                  const order = getTransactionOrder(transaction);

                  return (
                    <tr key={transaction.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-extrabold text-blue-800">
                          {getTransactionNumber(transaction)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                        {getOrderNumber(order)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                        {getTableLabel(order)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                        {getTransactionPaymentMethod(transaction)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-extrabold text-slate-950">
                        {formatCurrency(getTransactionTotal(transaction))}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatCurrency(getTransactionPaidAmount(transaction))}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatCurrency(getTransactionChangeAmount(transaction))}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDateTime(getTransactionTime(transaction))}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenTransaction(transaction)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </CashierShell>
  );
}
