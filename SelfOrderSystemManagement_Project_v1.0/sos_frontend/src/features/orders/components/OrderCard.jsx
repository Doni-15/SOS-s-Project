import { Clock, ReceiptText, Utensils } from "lucide-react";

import { formatCurrency, formatShortTime } from "../../../shared/utils/formatters";
import { cn } from "../../../shared/utils/cn";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrderCard({ order, isSelected = false, onSelect }) {
  const itemCount = order?.orderItems?.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className={cn(
        "w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md",
        isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">
            {order.orderNumber}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Meja {order.table?.tableNumber || "-"}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-slate-400" />
          <span>{itemCount || 0} item dipesan</span>
        </div>

        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-slate-400" />
          <span className="font-bold text-slate-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{formatShortTime(order.createdAt || order.submittedAt)}</span>
        </div>
      </div>
    </button>
  );
}
