import { formatCurrency } from "../../../shared/utils/formatters";
import { getOrderTotal } from "../utils/cashierOrderHelpers";

export function CashierOrderSummaryCard({ order }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-950">
        Ringkasan Tagihan
      </h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-800">
            {formatCurrency(getOrderTotal(order))}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-extrabold text-slate-950">Total</span>
          <span className="text-xl font-extrabold text-blue-700">
            {formatCurrency(getOrderTotal(order))}
          </span>
        </div>
      </div>
    </section>
  );
}
