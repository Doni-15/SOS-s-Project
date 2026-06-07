import { Loader2, X } from "lucide-react";

import { cn } from "../utils/cn";

const variantClassName = {
  default: "bg-blue-700 text-white hover:bg-blue-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel = "Batal",
  confirmLabel = "Konfirmasi",
  processingLabel = "Memproses...",
  variant = "default",
  isProcessing = false,
  errorMessage = "",
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  const handleCancel = () => {
    if (!isProcessing) {
      onCancel?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={handleCancel}
        aria-label="Tutup dialog"
      />

      <section className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {isProcessing ? (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            Permintaan sedang diproses. Mohon tunggu sebentar.
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70",
              variantClassName[variant] ?? variantClassName.default,
            )}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isProcessing ? processingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
