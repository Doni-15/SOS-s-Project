import {
  BarChart3,
  ReceiptText,
  ShoppingCart,
  Star,
} from "lucide-react";

import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { StatCard } from "../../../shared/components/StatCard";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import { formatCurrency, formatNumber } from "../../../shared/utils/formatters";
import {
  useDailySales,
  useSalesSummary,
  useTopMenuItems,
} from "../../reports/hooks/useOwnerReports";
import { DailySalesMiniChart } from "../../reports/components/DailySalesMiniChart";
import { TopMenuList } from "../../reports/components/TopMenuList";

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getLastSevenDaysParams() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
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

function getTopMenuName(topMenuReport) {
  const rows = Array.isArray(topMenuReport)
    ? topMenuReport
    : topMenuReport?.items ?? topMenuReport?.topMenuItems ?? [];

  const first = rows[0];

  return pickText(first, ["name", "menuName", "itemName"], "-");
}

export function OwnerDashboardPage() {
  const params = getLastSevenDaysParams();

  const salesSummaryQuery = useSalesSummary(params);
  const dailySalesQuery = useDailySales(params);
  const topMenuQuery = useTopMenuItems({
    ...params,
    limit: 5,
  });

  const isLoading =
    salesSummaryQuery.isLoading ||
    dailySalesQuery.isLoading ||
    topMenuQuery.isLoading;

  const isError =
    salesSummaryQuery.isError ||
    dailySalesQuery.isError ||
    topMenuQuery.isError;

  const refetchAll = () => {
    salesSummaryQuery.refetch();
    dailySalesQuery.refetch();
    topMenuQuery.refetch();
  };

  const summary = salesSummaryQuery.data ?? {};

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

  return (
    <DashboardShell
      badge="Dashboard"
      title="Dashboard Pemilik"
      description="Ringkasan performa restoran berdasarkan data backend."
    >
      {isLoading ? <LoadingState message="Memuat dashboard owner..." /> : null}

      {isError ? (
        <ErrorState
          title="Dashboard gagal dimuat"
          message={
            salesSummaryQuery.error?.message ||
            dailySalesQuery.error?.message ||
            topMenuQuery.error?.message ||
            "Terjadi kesalahan saat mengambil data report."
          }
          onRetry={refetchAll}
          isRetrying={
            salesSummaryQuery.isFetching ||
            dailySalesQuery.isFetching ||
            topMenuQuery.isFetching
          }
        />
      ) : null}

      {!isLoading && !isError ? (
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={ReceiptText}
              label="Total Pendapatan"
              value={formatCurrency(totalRevenue)}
              helper="Periode 7 hari terakhir"
            />

            <StatCard
              icon={ShoppingCart}
              label="Jumlah Transaksi"
              value={formatNumber(totalTransactions)}
              helper="Transaksi berhasil"
            />

            <StatCard
              icon={BarChart3}
              label="Rata-rata Transaksi"
              value={formatCurrency(averageTransaction)}
              helper="Nilai rata-rata transaksi"
            />

            <StatCard
              icon={Star}
              label="Menu Terlaris"
              value={getTopMenuName(topMenuQuery.data)}
              helper="Berdasarkan item terjual"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
            <DailySalesMiniChart items={dailySalesQuery.data} />
            <TopMenuList data={topMenuQuery.data} />
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
