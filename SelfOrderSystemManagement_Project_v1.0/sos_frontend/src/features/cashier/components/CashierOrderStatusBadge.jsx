import { cn } from "../../../shared/utils/cn";
import {
  CASHIER_ORDER_STATUS_LABELS,
  CASHIER_ORDER_STATUS_STYLES,
} from "../utils/cashierOrderHelpers";

export function CashierOrderStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-3 py-1 text-xs font-bold ring-1",
        CASHIER_ORDER_STATUS_STYLES[status] ??
          "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {CASHIER_ORDER_STATUS_LABELS[status] ?? status ?? "-"}
    </span>
  );
}
