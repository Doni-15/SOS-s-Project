import {
  BarChart3,
  CheckCircle2,
  CircleSlash,
  Info,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShoppingCart,
  Utensils,
  Users,
} from "lucide-react";

const ROLE_SUMMARY = {
  OWNER: {
    label: "Pemilik",
    description: "Dapat mengelola seluruh fitur administrasi restoran.",
    allowed: {
      dashboard: true,
      reports: true,
      analytics: true,
      menu: true,
      transactions: true,
      users: true,
      settings: true,
    },
  },
  CASHIER: {
    label: "Kasir",
    description: "Dapat mengelola transaksi penjualan dan operasional harian.",
    allowed: {
      dashboard: true,
      reports: false,
      analytics: false,
      menu: true,
      transactions: true,
      users: false,
      settings: false,
    },
  },
};

const ACCESS_ITEMS = [
  {
    key: "dashboard",
    label: "Lihat Dashboard",
    description: "Melihat ringkasan performa",
    icon: LayoutDashboard,
  },
  {
    key: "reports",
    label: "Laporan Penjualan",
    description: "Melihat laporan penjualan",
    icon: BarChart3,
  },
  {
    key: "analytics",
    label: "Analitik",
    description: "Melihat analitik restoran",
    icon: ReceiptText,
  },
  {
    key: "menu",
    label: "Menu",
    description: "Lihat dan kelola menu",
    icon: Utensils,
  },
  {
    key: "transactions",
    label: "Transaksi Penjualan",
    description: "Buat dan kelola transaksi",
    icon: ShoppingCart,
  },
  {
    key: "users",
    label: "Pengguna",
    description: "Kelola akun pengguna",
    icon: Users,
  },
  {
    key: "settings",
    label: "Pengaturan",
    description: "Pengaturan sistem",
    icon: Settings,
  },
];

export function AccessSummaryCard({ role }) {
  const summary = ROLE_SUMMARY[role] ?? ROLE_SUMMARY.CASHIER;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Info className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Ringkasan Hak Akses
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Hak akses berdasarkan peran yang dipilih.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <p className="font-extrabold text-slate-950">{summary.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {summary.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {ACCESS_ITEMS.map((item) => {
          const Icon = item.icon;
          const isAllowed = summary.allowed[item.key];

          return (
            <div key={item.key} className="flex items-center gap-3">
              <div
                className={
                  isAllowed
                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"
                    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400"
                }
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>

              <div
                className={
                  isAllowed
                    ? "flex items-center gap-1 text-xs font-bold text-emerald-700"
                    : "flex items-center gap-1 text-xs font-bold text-slate-400"
                }
              >
                {isAllowed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Diizinkan
                  </>
                ) : (
                  <>
                    <CircleSlash className="h-4 w-4" />
                    Tidak Diizinkan
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
        Hak akses dapat berbeda sesuai peran yang dipilih.
      </div>
    </aside>
  );
}
