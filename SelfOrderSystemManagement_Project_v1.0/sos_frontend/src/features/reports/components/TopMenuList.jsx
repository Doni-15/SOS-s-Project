import { formatCurrency, formatNumber } from "../../../shared/utils/formatters";

function getRows(data) {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.topMenuItems ?? data?.report ?? [];
}

function getName(item) {
  return item?.name ?? item?.menuName ?? item?.itemName ?? item?.menuItem?.name ?? "-";
}

function getQuantity(item) {
  return Number(item?.quantitySold ?? item?.totalQuantity ?? item?.quantity ?? item?.soldQty ?? 0);
}

function getRevenue(item) {
  return Number(item?.revenue ?? item?.totalRevenue ?? item?.totalAmount ?? item?.sales ?? 0);
}

export function TopMenuList({ data }) {
  const rows = getRows(data).slice(0, 5);
  const maxRevenue = Math.max(...rows.map(getRevenue), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-950">Top Menu Terlaris</h2>
      <p className="mt-1 text-sm text-slate-500">Berdasarkan transaksi backend</p>

      <div className="mt-5 space-y-4">
        {rows.length ? (
          rows.map((item, index) => {
            const revenue = getRevenue(item);
            const width = Math.max((revenue / maxRevenue) * 100, 8);

            return (
              <div key={`${getName(item)}-${index}`} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-blue-700">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {getName(item)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(getQuantity(item))} porsi
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-extrabold text-slate-950">
                    {formatCurrency(revenue)}
                  </p>
                </div>

                <div className="ml-10 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Data menu terlaris belum tersedia.
          </div>
        )}
      </div>
    </section>
  );
}
