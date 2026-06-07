import {
  BarChart3,
  CalendarRange,
  Download,
  LineChart,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Star,
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
  formatNumber,
  formatShortDate,
} from "../../../shared/utils/formatters";
import {
  useDailySales,
  useSalesSummary,
  useTopMenuItems,
} from "../../reports/hooks/useOwnerReports";
import { useTransactions } from "../../transactions/hooks/useTransactions";

const PERIOD_OPTIONS = [
  { value: "7", label: "7 Hari Terakhir" },
  { value: "14", label: "14 Hari Terakhir" },
  { value: "30", label: "30 Hari Terakhir" },
];

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodParams(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (Number(days) - 1));

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

function getArray(data, keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

function getDailyRows(data) {
  return getArray(data, ["dailySales", "items", "rows", "data"]);
}

function getTopMenuRows(data) {
  return getArray(data, ["topMenuItems", "items", "rows", "data"]);
}

function getRevenue(item) {
  return pickNumber(item, ["revenue", "totalRevenue", "totalAmount", "sales", "grossSales"]);
}

function getTransactionCount(item) {
  return pickNumber(item, ["transactions", "totalTransactions", "transactionCount", "count"]);
}

function getQuantity(item) {
  return pickNumber(item, ["quantitySold", "totalQuantity", "quantity", "soldQty"]);
}

function getDate(item) {
  return item?.date ?? item?.day ?? item?.transactionDate ?? item?.createdAt;
}

function getMenuName(item) {
  return item?.name ?? item?.menuName ?? item?.itemName ?? item?.menuItem?.name ?? "-";
}

function getMenuRevenue(item) {
  return pickNumber(item, ["revenue", "totalRevenue", "totalAmount", "grossSales"]);
}

function getMenuQuantity(item) {
  return getQuantity(item);
}

function normalizeTransactionList(data) {
  if (Array.isArray(data)) return data;
  return data?.transactions ?? data?.items ?? [];
}

function normalizePaymentMethod(method) {
  const labels = {
    CASH: "Tunai",
    QRIS: "QRIS",
    DEBIT_CARD: "Kartu Debit",
    CREDIT_CARD: "Kartu Kredit",
    EWALLET: "E-Wallet",
  };

  return labels[method] ?? method ?? "Tidak diketahui";
}

function buildPaymentDistribution(transactions) {
  const map = new Map();

  for (const transaction of transactions) {
    const method = normalizePaymentMethod(transaction?.paymentMethod);
    const amount = pickNumber(transaction, ["totalAmount", "paidAmount", "amount"]);

    if (!map.has(method)) {
      map.set(method, { label: method, amount: 0, count: 0 });
    }

    const current = map.get(method);
    current.amount += amount;
    current.count += 1;
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function buildCategoryDistribution(transactions) {
  const map = new Map();

  for (const transaction of transactions) {
    const orderItems =
      transaction?.order?.orderItems ??
      transaction?.orderItems ??
      transaction?.items ??
      [];

    for (const item of orderItems) {
      const category =
        item?.categoryNameSnapshot ??
        item?.categoryName ??
        item?.menuItem?.category?.name ??
        "Tanpa kategori";

      const subtotal = pickNumber(item, ["subtotal", "totalAmount", "amount"]);

      if (!map.has(category)) {
        map.set(category, { label: category, amount: 0, count: 0 });
      }

      const current = map.get(category);
      current.amount += subtotal;
      current.count += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function exportAnalyticsCsv({ summary, dailyRows, topMenuRows }) {
  const lines = [];

  lines.push(["Section", "Metric", "Value"]);
  lines.push(["Summary", "Total Revenue", summary.totalRevenue]);
  lines.push(["Summary", "Total Transactions", summary.totalTransactions]);
  lines.push(["Summary", "Average Transaction", summary.averageTransaction]);
  lines.push(["Summary", "Total Items", summary.totalItems]);
  lines.push([]);

  lines.push(["Daily Sales"]);
  lines.push(["Date", "Revenue", "Transactions"]);
  for (const row of dailyRows) {
    lines.push([getDate(row), getRevenue(row), getTransactionCount(row)]);
  }

  lines.push([]);
  lines.push(["Top Menu"]);
  lines.push(["Menu", "Quantity", "Revenue"]);
  for (const row of topMenuRows) {
    lines.push([getMenuName(row), getMenuQuantity(row), getMenuRevenue(row)]);
  }

  const csvContent = lines
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
  link.download = `analitik-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function AnalyticsFilter({ period, onPeriodChange, onExport, exportDisabled }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Filter Analitik
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sesuaikan periode untuk membaca tren dan performa penjualan.
          </p>
        </div>

        <Button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="h-10 w-full bg-white px-4 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50 disabled:bg-slate-50 disabled:text-slate-400 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Unduh Laporan
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
          <CalendarRange className="h-5 w-5 text-blue-700" />
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-slate-500">Periode</span>
            <select
              value={period}
              onChange={(event) => onPeriodChange(event.target.value)}
              className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
          <LineChart className="h-5 w-5 text-blue-700" />
          <div>
            <span className="block text-xs font-bold text-slate-500">Perbandingan</span>
            <p className="text-sm font-bold text-slate-800">Periode sebelumnya</p>
          </div>
        </div>

        <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
          <PackageCheck className="h-5 w-5 text-blue-700" />
          <div>
            <span className="block text-xs font-bold text-slate-500">Sumber Data</span>
            <p className="text-sm font-bold text-slate-800">Backend report</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendChart({ rows }) {
  const chartRows = rows.slice(-14);
  const maxRevenue = Math.max(...chartRows.map(getRevenue), 1);

  if (!chartRows.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">Tren Penjualan Harian</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pendapatan berdasarkan transaksi selesai.
        </p>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            title="Data tren belum tersedia"
            description="Belum ada data daily sales pada periode yang dipilih."
          />
        </div>
      </section>
    );
  }

  const points = chartRows.map((row, index) => {
    const x = chartRows.length === 1 ? 50 : (index / (chartRows.length - 1)) * 100;
    const y = 100 - (getRevenue(row) / maxRevenue) * 76 - 12;

    return { x, y, row };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Tren Penjualan Harian
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pendapatan berdasarkan transaksi selesai.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {chartRows.length} hari
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-5">
        <svg viewBox="0 0 100 110" className="h-60 w-full overflow-visible">
          {[20, 40, 60, 80, 100].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          ))}

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={`${getDate(point.row)}-${index}`}>
              <circle cx={point.x} cy={point.y} r="2.4" fill="#2563eb" />
              <text
                x={point.x}
                y="107"
                textAnchor="middle"
                className="fill-slate-500 text-[4px] font-semibold"
              >
                {formatShortDate(getDate(point.row))}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function TopMenuAnalytics({ rows }) {
  const items = rows.slice(0, 5);
  const maxRevenue = Math.max(...items.map(getMenuRevenue), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-950">Top 5 Menu Terlaris</h2>
      <p className="mt-1 text-sm text-slate-500">
        Ranking berdasarkan penjualan dan jumlah porsi.
      </p>

      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((item, index) => {
            const revenue = getMenuRevenue(item);
            const width = Math.max((revenue / maxRevenue) * 100, 8);

            return (
              <div key={`${getMenuName(item)}-${index}`} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-extrabold text-white">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {getMenuName(item)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(getMenuQuantity(item))} porsi
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-extrabold text-blue-700">
                    {formatCurrency(revenue)}
                  </p>
                </div>

                <div className="ml-11 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-700"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
            <EmptyState
              title="Data menu belum tersedia"
              description="Belum ada data top menu pada periode yang dipilih."
            />
          </div>
        )}
      </div>
    </section>
  );
}

function DistributionCard({ title, description, rows, emptyTitle }) {
  const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      {rows.length ? (
        <div className="mt-5 space-y-4">
          {rows.slice(0, 5).map((row) => {
            const percentage = total > 0 ? (row.amount / total) * 100 : 0;

            return (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-slate-700">{row.label}</span>
                  <span className="font-extrabold text-slate-950">
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-700"
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>

                <p className="text-xs font-semibold text-slate-500">
                  {formatCurrency(row.amount)} · {formatNumber(row.count)} transaksi/item
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            title={emptyTitle}
            description="Data ini akan tampil jika response transaksi memuat informasi yang dibutuhkan."
          />
        </div>
      )}
    </section>
  );
}

function InsightCard({ topMenuRows, summary }) {
  const topMenu = topMenuRows[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-950">Insight Utama</h2>
      <p className="mt-1 text-sm text-slate-500">
        Ringkasan otomatis dari data periode ini.
      </p>

      <div className="mt-5 space-y-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-950">Menu Terlaris</p>
            <p className="text-sm leading-6 text-slate-600">
              {topMenu
                ? `${getMenuName(topMenu)} menjadi menu terlaris dengan ${formatNumber(getMenuQuantity(topMenu))} porsi.`
                : "Belum ada menu terlaris pada periode ini."}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-950">Performa Transaksi</p>
            <p className="text-sm leading-6 text-slate-600">
              {summary.totalTransactions > 0
                ? `${formatNumber(summary.totalTransactions)} transaksi menghasilkan ${formatCurrency(summary.totalRevenue)}.`
                : "Belum ada transaksi selesai pada periode ini."}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-950">Rata-rata Transaksi</p>
            <p className="text-sm leading-6 text-slate-600">
              Nilai rata-rata transaksi periode ini adalah{" "}
              {formatCurrency(summary.averageTransaction)}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OwnerAnalyticsPage() {
  const [period, setPeriod] = useState("7");

  const reportParams = useMemo(() => getPeriodParams(period), [period]);

  const salesSummaryQuery = useSalesSummary(reportParams);
  const dailySalesQuery = useDailySales(reportParams);
  const topMenuQuery = useTopMenuItems({
    ...reportParams,
    limit: 5,
  });
  const transactionsQuery = useTransactions({
    ...reportParams,
    page: 1,
    limit: 100,
  });

  const summaryRaw = salesSummaryQuery.data ?? {};
  const dailyRows = getDailyRows(dailySalesQuery.data);
  const topMenuRows = getTopMenuRows(topMenuQuery.data);
  const transactions = normalizeTransactionList(transactionsQuery.data);

  const summary = {
    totalRevenue: pickNumber(summaryRaw, [
      "totalRevenue",
      "revenue",
      "grossSales",
      "totalSales",
      "totalIncome",
    ]),
    totalTransactions: pickNumber(summaryRaw, [
      "totalTransactions",
      "transactionCount",
      "transactions",
      "totalOrders",
    ]),
    averageTransaction: pickNumber(summaryRaw, [
      "averageTransaction",
      "averageTransactionValue",
      "avgTransaction",
      "averageOrderValue",
    ]),
    totalItems: topMenuRows.reduce((sum, item) => sum + getMenuQuantity(item), 0),
  };

  const paymentDistribution = buildPaymentDistribution(transactions);
  const categoryDistribution = buildCategoryDistribution(transactions);

  const isLoading =
    salesSummaryQuery.isLoading ||
    dailySalesQuery.isLoading ||
    topMenuQuery.isLoading ||
    transactionsQuery.isLoading;

  const isError =
    salesSummaryQuery.isError ||
    dailySalesQuery.isError ||
    topMenuQuery.isError ||
    transactionsQuery.isError;

  const refetchAll = () => {
    salesSummaryQuery.refetch();
    dailySalesQuery.refetch();
    topMenuQuery.refetch();
    transactionsQuery.refetch();
  };

  const handleExport = () => {
    exportAnalyticsCsv({
      summary,
      dailyRows,
      topMenuRows,
    });
  };

  return (
    <DashboardShell
      title="Analitik Penjualan"
      description="Pantau performa penjualan restoran Anda dengan data dan insight yang akurat."
    >
      <div className="space-y-5">
        <AnalyticsFilter
          period={period}
          onPeriodChange={setPeriod}
          onExport={handleExport}
          exportDisabled={!dailyRows.length && !topMenuRows.length}
        />

        {isLoading ? <LoadingState message="Memuat analitik penjualan..." /> : null}

        {isError ? (
          <ErrorState
            title="Analitik gagal dimuat"
            message={
              salesSummaryQuery.error?.message ||
              dailySalesQuery.error?.message ||
              topMenuQuery.error?.message ||
              transactionsQuery.error?.message ||
              "Terjadi kesalahan saat mengambil data analitik."
            }
            onRetry={refetchAll}
            isRetrying={
              salesSummaryQuery.isFetching ||
              dailySalesQuery.isFetching ||
              topMenuQuery.isFetching ||
              transactionsQuery.isFetching
            }
          />
        ) : null}

        {!isLoading && !isError ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={ReceiptText}
                label="Total Pendapatan"
                value={formatCurrency(summary.totalRevenue)}
                helper="Transaksi selesai"
              />

              <StatCard
                icon={ShoppingCart}
                label="Jumlah Transaksi"
                value={formatNumber(summary.totalTransactions)}
                helper="Pada periode terpilih"
              />

              <StatCard
                icon={TrendingUp}
                label="Rata-rata Transaksi"
                value={formatCurrency(summary.averageTransaction)}
                helper="Nilai rata-rata"
              />

              <StatCard
                icon={PackageCheck}
                label="Item Terjual"
                value={formatNumber(summary.totalItems)}
                helper="Berdasarkan top menu"
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.85fr)]">
              <TrendChart rows={dailyRows} />
              <TopMenuAnalytics rows={topMenuRows} />
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
              <DistributionCard
                title="Distribusi Metode Pembayaran"
                description="Komposisi transaksi berdasarkan metode pembayaran."
                rows={paymentDistribution}
                emptyTitle="Distribusi pembayaran belum tersedia"
              />

              <InsightCard topMenuRows={topMenuRows} summary={summary} />

              <DistributionCard
                title="Penjualan per Kategori"
                description="Komposisi penjualan berdasarkan kategori menu."
                rows={categoryDistribution}
                emptyTitle="Distribusi kategori belum tersedia"
              />
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-950">Ringkasan Performa</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Analitik ini menggunakan data dari backend report. Jika beberapa kartu
                    masih kosong, berarti transaksi pada periode tersebut belum tersedia atau
                    response transaksi belum memuat detail metode/kategori.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
