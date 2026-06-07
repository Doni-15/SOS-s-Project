import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  PieChart,
  QrCode,
  ReceiptText,
  Settings,
  UserCircle,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { ConfirmDialog } from "../components/ConfirmDialog";
import { ROLE_HOME_PATH, ROUTES, USER_ROLES } from "../constants/appConfig";
import { cn } from "../utils/cn";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { SystemNotificationDropdown } from "../../features/system/components/SystemNotificationDropdown";

const ownerNavigation = [
  {
    label: "Dashboard",
    to: ROUTES.ownerDashboard,
    icon: LayoutDashboard,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Laporan",
    to: ROUTES.ownerReports,
    icon: BarChart3,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Analitik",
    to: ROUTES.ownerAnalytics,
    icon: PieChart,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Menu",
    to: ROUTES.ownerMenu,
    icon: Utensils,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Meja & QR",
    to: ROUTES.ownerTables,
    icon: QrCode,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Pengguna",
    to: ROUTES.ownerUsers,
    icon: Users,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Pengaturan",
    to: ROUTES.ownerSettings,
    icon: Settings,
    roles: [USER_ROLES.OWNER],
  },
];

const cashierNavigation = [
  {
    label: "Order Kasir",
    to: ROUTES.cashierOrders,
    icon: ReceiptText,
    roles: [USER_ROLES.OWNER, USER_ROLES.CASHIER],
  },
  {
    label: "Transaksi",
    to: ROUTES.cashierTransactions,
    icon: BarChart3,
    roles: [USER_ROLES.OWNER, USER_ROLES.CASHIER],
  },
  {
    label: "Menu",
    to: ROUTES.cashierMenu,
    icon: Utensils,
    roles: [USER_ROLES.OWNER, USER_ROLES.CASHIER],
  },
];

function getNavigationItems(user) {
  if (user?.role === USER_ROLES.CASHIER) {
    return cashierNavigation;
  }

  return ownerNavigation;
}

function SidebarContent({ user, onLogout, onClose }) {
  const navigationItems = getNavigationItems(user);

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-[#123372] text-white">
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mx-auto flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white p-[3px] shadow-sm">
              <img
                src="/assets/auth/kedai-logo-abu.png"
                alt="Kedai Nusantara"
                className="h-full w-full scale-[1.70] object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-50">
                Sistem Resto
              </p>
              <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-50">
                Nusantara
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-blue-100 hover:bg-white/10 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-2">
        {navigationItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                    isActive
                      ? "bg-white text-[#123372] shadow-sm"
                      : "text-blue-50/85 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="mx-4 border-t border-white/15 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:border-red-200/40 hover:bg-red-500/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-200/40"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({
  title,
  description,
  children,
  headerAction,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const userHomePath = ROLE_HOME_PATH[user?.role] ?? ROUTES.login;
  const greetingRole = user?.role === USER_ROLES.OWNER ? "Pemilik" : "Kasir";

  const handleRequestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleCancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-hidden lg:block">
        <SidebarContent user={user} onLogout={handleRequestLogout} />
      </aside>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup overlay"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative h-full w-64 overflow-hidden shadow-2xl">
            <SidebarContent
              user={user}
              onLogout={handleRequestLogout}
              onClose={() => setIsSidebarOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        title="Keluar dari sistem?"
        description="Sesi login Anda akan diakhiri. Anda perlu login ulang untuk mengakses halaman internal."
        cancelLabel="Batal"
        confirmLabel="Keluar"
        variant="danger"
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      <section className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
                aria-label="Buka menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(userHomePath)}
                  className="truncate text-left text-base font-extrabold text-slate-950 sm:text-lg"
                >
                  Selamat datang, {greetingRole}!
                </button>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                  {description || "Berikut ringkasan performa resto Anda hari ini."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <SystemNotificationDropdown />

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold leading-5 text-slate-950">
                    {user?.fullName || user?.username || greetingRole}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {greetingRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                {title}
              </h1>
            </div>

            {headerAction ? <div>{headerAction}</div> : null}
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
