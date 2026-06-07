import { cn } from "../../../shared/utils/cn";

const statusLabel = {
  AVAILABLE: "Tersedia",
  OUT_OF_STOCK: "Habis",
  HIDDEN: "Disembunyikan",
};

const statusClassName = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  OUT_OF_STOCK: "bg-red-50 text-red-700 ring-red-100",
  HIDDEN: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function MenuStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusClassName[status] ?? "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {statusLabel[status] ?? status ?? "-"}
    </span>
  );
}
