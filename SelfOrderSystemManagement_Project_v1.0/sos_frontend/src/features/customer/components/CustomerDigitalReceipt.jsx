import { ReceiptText, Sparkles } from "lucide-react";

import { ReceiptPreview } from "../../transactions/components/ReceiptPreview";

function normalizeCustomerTransaction(order) {
  const transaction = order?.transaction ?? null;

  if (!transaction) {
    return null;
  }

  return {
    ...transaction,
    order: transaction.order ?? {
      id: order?.id,
      orderNumber: order?.orderNumber,
      table: order?.table ?? null,
      status: order?.status,
      totalAmount: order?.totalAmount,
      customerName: order?.customerName ?? null,
      customerNote: order?.customerNote ?? null,
      orderItems: order?.orderItems ?? [],
    },
  };
}

function getCustomerReceipt(order, transaction) {
  return order?.receipt ?? transaction?.receipt ?? transaction?.receiptData ?? null;
}

export function CustomerDigitalReceipt({ order }) {
  const transaction = normalizeCustomerTransaction(order);
  const receipt = getCustomerReceipt(order, transaction);

  if (order?.status !== "PAID" || !transaction || !receipt) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_58%,#eff6ff_100%)] p-5 text-center shadow-sm ring-1 ring-emerald-100">
        <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-100" />
        <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-blue-100" />

        <div className="relative">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
            <ReceiptText size={28} />
          </div>

          <p className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            <Sparkles size={15} />
            Pembayaran Berhasil
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Struk Digital Tersedia
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
            Simpan struk ini sebagai bukti pembayaran pesanan kamu.
          </p>
        </div>
      </div>

      <ReceiptPreview transaction={transaction} receipt={receipt} />
    </section>
  );
}
