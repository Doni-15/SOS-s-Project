import { ShieldCheck } from "lucide-react";

import { getTableLabel } from "../utils/customerOrderHelpers";

const CUSTOMER_LOGO_SRC = "/assets/auth/kedai-logo-abu.png";

export function CustomerPublicShell({
  table,
  title = "Kedai Nusantara",
  children,
  footer,
}) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto min-h-screen w-full bg-white shadow-none sm:max-w-[480px] sm:shadow-2xl sm:shadow-slate-900/10 lg:my-6 lg:min-h-[calc(100vh-3rem)] lg:overflow-hidden lg:rounded-[2rem]">
        <header className="sticky top-0 z-40">
          <div className="bg-[linear-gradient(135deg,#075eea_0%,#064fd1_58%,#0b63e5_100%)] text-white shadow-lg shadow-blue-900/15">
            <div className="flex items-center gap-3 px-4 py-5">
              <div className="grid h-[92px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-[1.75rem] bg-white p-0 shadow-xl shadow-blue-950/20 ring-1 ring-white/50">
                <img
                  src={CUSTOMER_LOGO_SRC}
                  alt="Logo Kedai Nusantara"
                  className="h-full w-full object-contain scale-[1.18]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black leading-tight tracking-tight">
                  {title}
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-blue-50 sm:text-sm">
                  Sistem Resto Nusantara
                </p>
              </div>

              <div className="inline-flex max-w-[132px] shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-black ring-1 ring-white/15">
                <ShieldCheck size={15} className="shrink-0" />
                <span className="truncate">{getTableLabel(table)}</span>
              </div>
            </div>
          </div>
        </header>

        {children}
        {footer}
      </div>
    </main>
  );
}
