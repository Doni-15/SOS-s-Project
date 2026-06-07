import { formatCurrency } from "../../../shared/utils/formatters";
import {
  getOrderItemName,
  getOrderItemNote,
  getOrderItemQuantity,
  getOrderItemSubtotal,
  getOrderItemUnitPrice,
} from "../utils/cashierOrderHelpers";

export function CashierOrderItemsTable({ items = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-extrabold text-slate-950">
          Daftar Item
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-extrabold">Item</th>
              <th className="px-5 py-3 font-extrabold">Qty</th>
              <th className="px-5 py-3 font-extrabold">Harga</th>
              <th className="px-5 py-3 font-extrabold">Subtotal</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length ? (
              items.map((item) => (
                <tr key={item.id ?? getOrderItemName(item)}>
                  <td className="min-w-[260px] px-5 py-4">
                    <p className="font-extrabold text-slate-950">
                      {getOrderItemName(item)}
                    </p>
                    {getOrderItemNote(item) ? (
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Catatan: {getOrderItemNote(item)}
                      </p>
                    ) : null}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                    {getOrderItemQuantity(item)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatCurrency(getOrderItemUnitPrice(item))}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-extrabold text-slate-950">
                    {formatCurrency(getOrderItemSubtotal(item))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
                  Item pesanan tidak tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
