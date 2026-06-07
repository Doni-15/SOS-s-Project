import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "./Button";

export function LoadingState({ message = "Memuat data..." }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-blue-700" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Data gagal dimuat",
  message = "Terjadi kesalahan saat memuat data.",
  onRetry,
  isRetrying = false,
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
      <h3 className="mt-3 text-base font-bold text-red-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">
        {message}
      </p>

      {onRetry ? (
        <Button
          type="button"
          onClick={onRetry}
          isLoading={isRetrying}
          className="mx-auto mt-5 w-auto bg-red-700 px-4 py-2 text-sm shadow-none hover:bg-red-800 focus:ring-red-200 disabled:bg-red-300"
        >
          <RefreshCw className="h-4 w-4" />
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
