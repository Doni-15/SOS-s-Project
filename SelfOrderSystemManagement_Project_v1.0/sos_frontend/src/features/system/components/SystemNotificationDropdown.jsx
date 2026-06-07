import { Bell, CheckCircle2, RefreshCw, ServerCrash, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useHealthCheck } from "../hooks/useHealthCheck";

export function SystemNotificationDropdown() {
  const healthQuery = useHealthCheck();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  const notifications = useMemo(() => {
    if (healthQuery.isError) {
      return [
        {
          id: "backend-down",
          type: "danger",
          title: "Backend tidak terhubung",
          description:
            healthQuery.error?.message ||
            "Sistem tidak dapat menjangkau layanan backend saat ini.",
        },
      ];
    }

    return [];
  }, [healthQuery.error?.message, healthQuery.isError]);

  const unreadCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700"
        aria-label="Buka notifikasi"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1 text-[11px] font-extrabold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-950">
                Notifikasi
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Status penting sistem internal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-3">
            {healthQuery.isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-950">
                      Memeriksa status sistem
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Health check backend sedang berjalan.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {!healthQuery.isLoading && notifications.length ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-red-100 bg-red-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-700">
                        <ServerCrash className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-extrabold text-red-800">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-red-700">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!healthQuery.isLoading && !notifications.length ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-emerald-800">
                      Tidak ada notifikasi penting
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      Backend terhubung dan sistem berjalan normal.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs font-semibold text-slate-500">
              Auto check 30 detik
            </p>

            <button
              type="button"
              onClick={() => healthQuery.refetch()}
              disabled={healthQuery.isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={
                  healthQuery.isFetching
                    ? "h-3.5 w-3.5 animate-spin"
                    : "h-3.5 w-3.5"
                }
              />
              Refresh
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
