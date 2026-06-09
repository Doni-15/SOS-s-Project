import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Timer,
  Utensils,
} from "lucide-react";

import { cn } from "../../../shared/utils/cn";
import {
  formatCurrency,
  formatDateTime,
  getStatusMeta,
  getTableLabel,
} from "../utils/customerOrderHelpers";
import { CustomerDigitalReceipt } from "./CustomerDigitalReceipt";

const steps = [
  {
    key: "SUBMITTED",
    title: "Pesanan Dikirim",
    description: "Pesanan masuk ke sistem kasir.",
    icon: Clock3,
    step: 1,
  },
  {
    key: "ACCEPTED",
    title: "Diproses Kasir",
    description: "Kasir menerima dan menyiapkan pesananmu.",
    icon: Utensils,
    step: 2,
  },
  {
    key: "SERVED",
    title: "Sudah Dihidangkan",
    description: "Pesanan sudah sampai di meja.",
    icon: PackageCheck,
    step: 3,
  },
  {
    key: "PAID",
    title: "Pembayaran Selesai",
    description: "Struk digital tersedia.",
    icon: CreditCard,
    step: 4,
  },
];

function getStatusTone(status) {
  if (status === "PAID") return "emerald";
  if (status === "SERVED") return "indigo";
  if (status === "ACCEPTED") return "amber";
  if (status === "CANCELLED" || status === "EXPIRED") return "red";
  return "blue";
}

function getActiveStep(status, meta) {
  return meta?.step ?? steps.find((step) => step.key === status)?.step ?? 1;
}

export function CustomerOrderTracker({
  order,
  isLoading = false,
  isError = false,
  errorMessage = "",
  onRefresh = () => {},
  onNewOrder = () => {},
}) {
  const status = order?.status ?? "SUBMITTED";
  const statusMeta = getStatusMeta(status);
  const activeStep = getActiveStep(status, statusMeta);
  const tone = getStatusTone(status);

  if (isLoading && !order) {
    return (
      <div className="px-5 py-10">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <Loader2 className="mx-auto animate-spin text-blue-700" size={34} />
          <p className="mt-4 text-base font-black text-slate-950">
            Memuat tracking pesanan...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Tunggu sebentar, status terbaru sedang diambil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 py-6 pb-10">
      <section className="space-y-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl ring-1",
            tone === "emerald"
              ? "bg-[linear-gradient(135deg,#064e3b_0%,#047857_70%,#059669_100%)] shadow-emerald-900/15 ring-emerald-200/20"
              : tone === "indigo"
                ? "bg-[linear-gradient(135deg,#1e293b_0%,#334155_62%,#1d4ed8_100%)] shadow-slate-900/15 ring-slate-200/20"
                : tone === "amber"
                  ? "bg-[linear-gradient(135deg,#78350f_0%,#b45309_72%,#d97706_100%)] shadow-amber-900/15 ring-amber-200/20"
                  : tone === "red"
                    ? "bg-[linear-gradient(135deg,#7f1d1d_0%,#b91c1c_72%,#dc2626_100%)] shadow-red-900/15 ring-red-200/20"
                    : "bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_62%,#1d4ed8_100%)] shadow-slate-900/15 ring-slate-200/20",
          )}
        >
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white/80">
                <Timer size={15} />
                Tracking Pesanan
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {statusMeta.label}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-white/85">
                {statusMeta.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25"
              aria-label="Refresh status"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <RefreshCw size={22} />
              )}
            </button>
          </div>

          {isError ? (
            <div className="relative mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/20">
              {errorMessage || "Status gagal dimuat. Coba refresh kembali."}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              No. Pesanan
            </p>
            <p className="mt-2 break-all text-lg font-black text-slate-950">
              {order?.orderNumber ?? "-"}
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Meja
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">
              {getTableLabel(order?.table)}
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Pemesan
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">
              {order?.customerName ?? "-"}
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Total
            </p>
            <p className="mt-2 text-2xl font-black text-blue-700">
              {formatCurrency(order?.totalAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Progress Pesanan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Status akan diperbarui otomatis dari kasir.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isDone = activeStep >= step.step;
              const isCurrent = activeStep === step.step;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 transition",
                        isDone
                          ? "bg-blue-700 text-white ring-blue-700 shadow-lg shadow-blue-700/20"
                          : "bg-slate-50 text-slate-400 ring-slate-200",
                      )}
                    >
                      {isDone ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                    </div>

                    {!isLast ? (
                      <div
                        className={cn(
                          "h-10 w-1 rounded-full",
                          activeStep > step.step ? "bg-blue-700" : "bg-slate-200",
                        )}
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950">{step.title}</p>
                      {isCurrent ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700 ring-1 ring-blue-100">
                          Sekarang
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {order?.status === "PAID" ? <CustomerDigitalReceipt order={order} /> : null}
      </section>

      <aside className="space-y-5">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <ReceiptText size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Detail Pesanan
              </p>
              <p className="font-black text-slate-950">
                {formatDateTime(order?.submittedAt ?? order?.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {(order?.orderItems ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950">
                      {item.itemNameSnapshot}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} x {formatCurrency(item.unitPriceSnapshot)}
                    </p>
                    {item.note ? (
                      <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-100">
                        Catatan: {item.note}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-black text-slate-950">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-950">Total</span>
              <span className="text-2xl font-black text-blue-700">
                {formatCurrency(order?.totalAmount)}
              </span>
            </div>
          </div>

          {order?.status === "PAID" ? (
            <button
              type="button"
              onClick={onNewOrder}
              className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-blue-700 px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-slate-800"
            >
              <RotateCcw size={20} />
              Buat Pesanan Baru
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
