import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import {
  getOrderItemName,
  getOrderItemQuantity,
  getOrderItemSubtotal,
  getOrderNumber,
  getOrderTotal,
  getReceiptNumber,
  getTableLabel,
  getTransactionChangeAmount,
  getTransactionNumber,
  getTransactionPaidAmount,
} from "../utils/cashierOrderHelpers";

export function CashierReceiptPreview({ transaction, receipt }) {
  const order = transaction?.order ?? receipt?.transaction?.order ?? null;
  const items = order?.orderItems ?? transaction?.orderItems ?? [];
  const cashierName =
    transaction?.cashier?.fullName ||
    transaction?.cashier?.username ||
    receipt?.printedBy?.fullName ||
    receipt?.printedBy?.username ||
    "-";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-0 print:shadow-none">
      <div className="mx-auto max-w-[360px] rounded-2xl border border-slate-200 bg-white p-5 text-sm print:border-0 print:p-0">
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-slate-950">
            Kedai Nusantara
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Self Order System Management
          </p>
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">No. Struk</span>
            <span className="font-bold text-slate-900">
              {getReceiptNumber(receipt)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Transaksi</span>
            <span className="font-bold text-slate-900">
              {getTransactionNumber(transaction)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Order</span>
            <span className="font-bold text-slate-900">
              {getOrderNumber(order)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Meja</span>
            <span className="font-bold text-slate-900">
              {getTableLabel(order)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Kasir</span>
            <span className="font-bold text-slate-900">{cashierName}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Waktu</span>
            <span className="font-bold text-slate-900">
              {formatDateTime(transaction?.transactionTime ?? transaction?.createdAt)}
            </span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="space-y-3">
          {items.length ? (
            items.map((item) => (
              <div key={item.id ?? getOrderItemName(item)}>
                <div className="flex justify-between gap-3">
                  <span className="font-bold text-slate-900">
                    {getOrderItemName(item)}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(getOrderItemSubtotal(item))}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Qty {getOrderItemQuantity(item)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-xs font-semibold text-slate-500">
              Item pesanan tidak tersedia.
            </p>
          )}
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Total</span>
            <span className="font-extrabold text-slate-950">
              {formatCurrency(transaction?.totalAmount ?? getOrderTotal(order))}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Dibayar</span>
            <span className="font-extrabold text-slate-950">
              {formatCurrency(getTransactionPaidAmount(transaction))}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Kembalian</span>
            <span className="font-extrabold text-slate-950">
              {formatCurrency(getTransactionChangeAmount(transaction))}
            </span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-300" />

        <p className="text-center text-xs font-semibold leading-5 text-slate-500">
          Terima kasih. Simpan struk ini sebagai bukti pembayaran.
        </p>
      </div>
    </section>
  );
}
