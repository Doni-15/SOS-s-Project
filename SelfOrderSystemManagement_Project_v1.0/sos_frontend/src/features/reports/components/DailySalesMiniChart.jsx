import { formatCurrency, formatShortDate } from "../../../shared/utils/formatters";

function getRevenue(item) {
  return Number(
    item?.revenue ??
      item?.totalRevenue ??
      item?.totalAmount ??
      item?.sales ??
      0,
  );
}

function getDate(item) {
  return item?.date ?? item?.day ?? item?.transactionDate ?? item?.createdAt;
}

export function DailySalesMiniChart({ items = [] }) {
  const rows = Array.isArray(items) ? items : items?.items ?? items?.dailySales ?? [];
  const maxRevenue = Math.max(...rows.map(getRevenue), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Grafik Penjualan
          </h2>
          <p className="mt-1 text-sm text-slate-500">Periode 7 hari terakhir</p>
        </div>
      </div>

      {!rows.length ? (
        <div className="mt-5 flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500">
          Data grafik belum tersedia.
        </div>
      ) : (
        <div className="mt-6 flex h-56 items-end gap-3 border-b border-slate-200 pb-4">
          {rows.map((item, index) => {
            const revenue = getRevenue(item);
            const height = Math.max((revenue / maxRevenue) * 100, 6);

            return (
              <div key={`${getDate(item)}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-t-xl bg-slate-50 px-1">
                  <div
                    className="w-full rounded-t-xl bg-blue-600"
                    style={{ height: `${height}%` }}
                    title={formatCurrency(revenue)}
                  />
                </div>
                <span className="truncate text-xs font-semibold text-slate-500">
                  {formatShortDate(getDate(item))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
