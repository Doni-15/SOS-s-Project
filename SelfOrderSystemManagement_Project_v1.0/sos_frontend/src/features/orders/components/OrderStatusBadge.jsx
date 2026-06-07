import { ORDER_STATUS_LABELS } from "../constants/orderConstants";
import { cn } from "../../../shared/utils/cn";

const statusClassName = {
  SUBMITTED: "bg-amber-100 text-amber-800 ring-amber-200",
  ACCEPTED: "bg-blue-100 text-blue-800 ring-blue-200",
  PAID: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 ring-red-200",
  EXPIRED: "bg-slate-200 text-slate-700 ring-slate-300",
};

export function OrderStatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        statusClassName[status] || "bg-slate-100 text-slate-700 ring-slate-200",
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status] || status || "-"}
    </span>
  );
}
