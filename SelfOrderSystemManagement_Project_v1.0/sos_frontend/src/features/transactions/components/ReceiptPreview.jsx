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
  getCustomerName,
} from "../../cashier/utils/cashierOrderHelpers";

const RECEIPT_LOGO_SRC = "/assets/auth/kedai-logo-abu.png";

export function ReceiptPreview({ transaction, receipt }) {
  const order = transaction?.order ?? receipt?.transaction?.order ?? null;
  const items = order?.orderItems ?? transaction?.orderItems ?? [];
  const cashierName =
    transaction?.cashier?.fullName ||
    transaction?.cashier?.username ||
    receipt?.printedBy?.fullName ||
    receipt?.printedBy?.username ||
    "-";
  const receiptPayload = receipt?.receiptPayload ?? {};
  const customerName =
    getCustomerName(order) || receiptPayload.customerName || "-";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-0 print:shadow-none">
      <div className="mx-auto max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-[0_18px_60px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 print:border-0 print:p-0 print:shadow-none print:ring-0">
        <div className="relative min-h-[560px] [print-color-adjust:exact]">
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden="true"
          >
            <img
              src={RECEIPT_LOGO_SRC}
              alt=""
              className="absolute left-1/2 top-[48%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.045] grayscale print:opacity-[0.055]"
            />

            <div className="absolute -right-16 top-10 h-36 w-36 rounded-full bg-emerald-200/20 blur-3xl print:hidden" />
            <div className="absolute -left-16 bottom-16 h-36 w-36 rounded-full bg-slate-300/20 blur-3xl print:hidden" />
          </div>

          <div className="relative z-10">
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <img
                  src={RECEIPT_LOGO_SRC}
                  alt="Kedai Nusantara"
                  className="h-11 w-11 object-contain"
                />
              </div>

              <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
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
                <span className="text-right font-bold text-slate-900">
                  {getReceiptNumber(receipt)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Transaksi</span>
                <span className="text-right font-bold text-slate-900">
                  {getTransactionNumber(transaction)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Order</span>
                <span className="text-right font-bold text-slate-900">
                  {getOrderNumber(order)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Meja</span>
                <span className="text-right font-bold text-slate-900">
                  {getTableLabel(order)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Pelanggan</span>
                <span className="text-right font-bold text-slate-900">
                  {customerName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Kasir</span>
                <span className="text-right font-bold text-slate-900">
                  {cashierName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Waktu</span>
                <span className="text-right font-bold text-slate-900">
                  {formatDateTime(
                    receipt?.printedAt ||
                      transaction?.paidAt ||
                      transaction?.createdAt ||
                      order?.paidAt ||
                      order?.createdAt,
                  )}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-dashed border-slate-300" />

            <div className="space-y-4">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div
                    key={item.id ?? item.menuItemId ?? index}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-950">
                        {getOrderItemName(item)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Qty {getOrderItemQuantity(item)}
                      </p>
                      {item.note ? (
                        <p className="mt-1 text-[11px] leading-4 text-slate-400">
                          Catatan: {item.note}
                        </p>
                      ) : null}
                    </div>

                    <p className="shrink-0 text-right font-extrabold text-slate-950">
                      {formatCurrency(getOrderItemSubtotal(item))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-500">
                  Tidak ada item pesanan.
                </p>
              )}
            </div>

            <div className="my-4 border-t border-dashed border-slate-300" />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Total</span>
                <span className="font-extrabold text-slate-950">
                  {formatCurrency(getOrderTotal(order))}
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

            <div className="rounded-2xl bg-slate-50/80 px-4 py-3 text-center ring-1 ring-slate-100">
              <p className="text-xs font-extrabold leading-5 text-slate-600">
                Terima kasih. Simpan struk ini sebagai bukti pembayaran.
              </p>
            </div>

            <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Powered by Kedai Nusantara
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
