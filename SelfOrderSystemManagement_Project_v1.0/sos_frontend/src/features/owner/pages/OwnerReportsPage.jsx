import {
  Download,
  Filter,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { EmptyState } from "../../../shared/components/EmptyState";
import { StatCard } from "../../../shared/components/StatCard";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../../shared/utils/formatters";
import { useSalesSummary } from "../../reports/hooks/useOwnerReports";
import { TransactionStatusBadge } from "../../transactions/components/TransactionStatusBadge";
import { useTransactions } from "../../transactions/hooks/useTransactions";

const PERIOD_OPTIONS = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return toDateInputValue(date);
}

function getDefaultEndDate() {
  return toDateInputValue(new Date());
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null) {
      return Number(value);
    }
  }

  return 0;
}

function pickText(source, keys, fallback = "-") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return fallback;
}

function normalizePaymentMethod(method) {
  const labels = {
    CASH: "Tunai",
    QRIS: "QRIS",
    DEBIT_CARD: "Kartu Debit",
    CREDIT_CARD: "Kartu Kredit",
    EWALLET: "E-Wallet",
  };

  return labels[method] ?? method ?? "-";
}

function getTransactionId(transaction) {
  return pickText(transaction, ["transactionNumber", "code", "id"], "-");
}

function getTransactionDate(transaction) {
  return (
    transaction?.createdAt ??
    transaction?.paidAt ??
    transaction?.transactionDate ??
    transaction?.date
  );
}

function getTransactionTotal(transaction) {
  return pickNumber(transaction, [
    "totalAmount",
    "paidAmount",
    "amount",
    "grandTotal",
  ]);
}

function getTableDetail(transaction) {
  return (
    transaction?.order?.table?.tableNumber ??
    transaction?.table?.tableNumber ??
    transaction?.tableNumber ??
    transaction?.order?.tableNumber ??
    "-"
  );
}

function exportTransactionsCsv(transactions) {
  const headers = ["Tanggal", "ID Transaksi", "Meja / Detail", "Metode", "Total", "Status"];

  const rows = transactions.map((transaction) => [
    formatDateTime(getTransactionDate(transaction)),
    getTransactionId(transaction),
    getTableDetail(transaction),
    normalizePaymentMethod(transaction?.paymentMethod),
    getTransactionTotal(transaction),
    transaction?.status ?? "PAID",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

export function OwnerReportsPage() {
  const [draftFilters, setDraftFilters] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    period: "daily",
  });

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [page, setPage] = useState(1);

  const reportParams = useMemo(
    () => ({
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      period: appliedFilters.period,
    }),
    [appliedFilters],
  );

  const transactionParams = useMemo(
    () => ({
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      page,
      limit: 8,
    }),
    [appliedFilters, page],
  );

  const salesSummaryQuery = useSalesSummary(reportParams);
  const transactionsQuery = useTransactions(transactionParams);

  const summary = salesSummaryQuery.data ?? {};
  const transactionResult = transactionsQuery.data ?? {};
  const transactions = transactionResult.transactions ?? [];
  const pagination = transactionResult.pagination ?? {};

  const totalRevenue = pickNumber(summary, [
    "totalRevenue",
    "revenue",
    "totalSales",
    "totalIncome",
  ]);

  const totalTransactions = pickNumber(summary, [
    "totalTransactions",
    "transactionCount",
    "transactions",
    "totalOrders",
  ]);

  const averageTransaction = pickNumber(summary, [
    "averageTransaction",
    "averageTransactionValue",
    "avgTransaction",
    "averageOrderValue",
  ]);

  const isLoading = salesSummaryQuery.isLoading || transactionsQuery.isLoading;
  const isError = salesSummaryQuery.isError || transactionsQuery.isError;

  const totalPages =
    Number(pagination.totalPages) ||
    Math.max(Math.ceil(Number(pagination.total || transactions.length) / 8), 1);

  const handleFilterChange = (field) => (event) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const handleExport = () => {
    exportTransactionsCsv(transactions);
  };

  const refetchAll = () => {
    salesSummaryQuery.refetch();
    transactionsQuery.refetch();
  };

  return (
    <DashboardShell
      title="Laporan Penjualan"
      description="Pantau performa penjualan resto Anda berdasarkan periode yang dipilih."
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                Filter Laporan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pilih rentang tanggal untuk melihat transaksi dan ringkasan penjualan.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleExport}
              disabled={!transactions.length}
              className="h-10 w-full bg-white px-4 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50 disabled:bg-slate-50 disabled:text-slate-400 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.85fr_auto]">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Tanggal Awal</span>
              <input
                type="date"
                value={draftFilters.startDate}
                onChange={handleFilterChange("startDate")}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Tanggal Akhir</span>
              <input
                type="date"
                value={draftFilters.endDate}
                onChange={handleFilterChange("endDate")}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Periode</span>
              <select
                value={draftFilters.period}
                onChange={handleFilterChange("period")}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleApplyFilters}
                className="h-11 w-full px-5 text-sm font-bold xl:w-auto"
              >
                <Filter className="h-4 w-4" />
                Terapkan
              </Button>
            </div>
          </div>
        </section>

        {isLoading ? <LoadingState message="Memuat laporan penjualan..." /> : null}

        {isError ? (
          <ErrorState
            title="Laporan gagal dimuat"
            message={
              salesSummaryQuery.error?.message ||
              transactionsQuery.error?.message ||
              "Terjadi kesalahan saat mengambil laporan."
            }
            onRetry={refetchAll}
            isRetrying={salesSummaryQuery.isFetching || transactionsQuery.isFetching}
          />
        ) : null}

        {!isLoading && !isError ? (
          <>
            <section className="grid gap-4 xl:grid-cols-3">
              <StatCard
                icon={ReceiptText}
                label="Total Pendapatan"
                value={formatCurrency(totalRevenue)}
                helper="Dari transaksi selesai"
              />

              <StatCard
                icon={ShoppingCart}
                label="Jumlah Transaksi"
                value={formatNumber(totalTransactions)}
                helper="Transaksi pada periode ini"
              />

              <StatCard
                icon={TrendingUp}
                label="Rata-rata Penjualan per Transaksi"
                value={formatCurrency(averageTransaction)}
                helper="Nilai rata-rata transaksi"
              />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950">
                    Daftar Transaksi Penjualan
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Data transaksi yang sudah tersimpan di backend.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {transactions.length} data
                </span>
              </div>

              {!transactions.length ? (
                <div className="p-5">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12">
                    <EmptyState
                      title="Belum ada transaksi"
                      description="Tidak ada transaksi pada periode yang dipilih."
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-extrabold">Tanggal</th>
                          <th className="px-5 py-3 font-extrabold">ID Transaksi</th>
                          <th className="px-5 py-3 font-extrabold">Meja / Detail</th>
                          <th className="px-5 py-3 font-extrabold">Metode</th>
                          <th className="px-5 py-3 font-extrabold">Total</th>
                          <th className="px-5 py-3 font-extrabold">Status</th>
                          <th className="px-5 py-3 font-extrabold">Aksi</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="transition hover:bg-slate-50">
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {formatDateTime(getTransactionDate(transaction))}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                              {getTransactionId(transaction)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {getTableDetail(transaction) === "-"
                                ? "-"
                                : `Meja ${getTableDetail(transaction)}`}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {normalizePaymentMethod(transaction.paymentMethod)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-950">
                              {formatCurrency(getTransactionTotal(transaction))}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <TransactionStatusBadge status={transaction.status ?? "PAID"} />
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <button
                                type="button"
                                className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
                              >
                                Lihat Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Menampilkan {transactions.length} transaksi
                    </p>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Sebelumnya
                      </button>

                      <span className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                        {page}
                      </span>

                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((current) => Math.min(current + 1, totalPages))
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
