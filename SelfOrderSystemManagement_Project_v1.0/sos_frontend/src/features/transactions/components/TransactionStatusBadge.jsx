import { cn } from "../../../shared/utils/cn";

const statusLabel = {
  PAID: "Selesai",
  SUCCESS: "Selesai",
  COMPLETED: "Selesai",
  GENERATED: "Selesai",
  CANCELLED: "Batal",
  FAILED: "Gagal",
  PENDING: "Pending",
};

const statusClassName = {
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  GENERATED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
  FAILED: "bg-red-50 text-red-700 ring-red-100",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
};

export function TransactionStatusBadge({ status = "PAID" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusClassName[status] ?? "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}
