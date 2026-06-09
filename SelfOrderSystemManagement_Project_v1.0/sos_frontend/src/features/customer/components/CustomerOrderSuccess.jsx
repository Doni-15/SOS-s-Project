import {
  CalendarClock,
  Check,
  ClipboardList,
  Clock3,
  ReceiptText,
  RotateCcw,
} from "lucide-react";

import { CustomerPublicShell } from "./CustomerPublicShell";
import {
  formatCurrency,
  formatOrderDate,
  getTableLabel,
} from "../utils/customerOrderHelpers";

function DetailRow({ icon: Icon, label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon size={20} />
        </div>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>

      <span className={`text-right text-sm font-black text-slate-950 ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

export function CustomerOrderSuccess({ order, table, onOrderAgain }) {
  const orderTable = order?.table ?? table;
  const submittedAt = order?.submittedAt ?? order?.createdAt;

  return (
    <CustomerPublicShell table={orderTable}>
      <section className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-8">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30">
              <Check size={58} strokeWidth={4} />
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-black text-slate-950">
            Pesanan Berhasil Dikirim
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-500">
            Pesanan kamu telah diterima sistem dan sedang menunggu diproses oleh
            kasir.
          </p>

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
            <Clock3 size={18} />
            Menunggu Diproses
          </div>

          <div className="mt-7 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200">
            <DetailRow
              icon={ReceiptText}
              label="No. Pesanan"
              value={order?.orderNumber ?? "-"}
              valueClassName="text-blue-700"
            />

            <DetailRow
              icon={ClipboardList}
              label="Meja"
              value={getTableLabel(orderTable)}
            />

            <DetailRow
              icon={CalendarClock}
              label="Waktu Pemesanan"
              value={formatOrderDate(submittedAt)}
            />

            <DetailRow
              icon={ReceiptText}
              label="Total"
              value={formatCurrency(order?.totalAmount)}
              valueClassName="text-blue-700"
            />
          </div>

          <button
            type="button"
            onClick={onOrderAgain}
            className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-blue-700 px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
          >
            <RotateCcw size={20} />
            Kembali ke Menu
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Simpan nomor pesanan ini jika kasir membutuhkan konfirmasi.
          </p>
        </div>
      </section>
    </CustomerPublicShell>
  );
}
