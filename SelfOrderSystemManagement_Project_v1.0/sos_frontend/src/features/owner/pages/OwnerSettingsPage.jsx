import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Server,
  UserCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "../../../shared/components/Button";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import { useAuth } from "../../auth/hooks/useAuth";
import { useHealthCheck } from "../../system/hooks/useHealthCheck";
import { useResetUserPassword } from "../../users/hooks/useUserMutations";
import {
  getRoleLabel,
  getUserDisplayName,
} from "../../users/utils/userHelpers";

function getHealthStatus(health) {
  return health?.status ?? health?.serviceStatus ?? health?.message ?? "-";
}

function getDatabaseStatus(health) {
  return health?.database ?? health?.db ?? health?.databaseStatus ?? "-";
}

export function OwnerSettingsPage() {
  const { user } = useAuth();
  const healthQuery = useHealthCheck();
  const resetPassword = useResetUserPassword();

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const health = healthQuery.data ?? {};
  const isHealthOk = !healthQuery.isError && Boolean(healthQuery.data);

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

    setMessage("");
    setError("");
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setError("Data user login tidak lengkap. Silakan login ulang.");
      return;
    }

    if (!passwordForm.newPassword) {
      setError("Password baru wajib diisi.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        id: user.id,
        password: passwordForm.newPassword,
      });

      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      setMessage("Password berhasil diperbarui.");
    } catch (err) {
      setError(err?.message || "Password gagal diperbarui.");
    }
  };

  return (
    <DashboardShell
      title="Pengaturan"
      description="Kelola akun dan pantau status koneksi sistem."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <UserCircle className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Akun Saya
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informasi akun yang sedang digunakan.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nama
                </p>
                <p className="mt-1 font-extrabold text-slate-950">
                  {getUserDisplayName(user)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Username
                </p>
                <p className="mt-1 font-extrabold text-slate-950">
                  {user?.username ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Peran
                </p>
                <p className="mt-1 font-extrabold text-slate-950">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <LockKeyhole className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-slate-950">
                  Ubah Password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Perbarui password akun yang sedang login.
                </p>
              </div>
            </div>

            {message ? (
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleChangePassword} className="mt-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Password Baru
                  </span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField("newPassword")}
                    autoComplete="new-password"
                    placeholder="Masukkan password baru"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Konfirmasi Password
                  </span>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={updatePasswordField("confirmPassword")}
                    autoComplete="new-password"
                    placeholder="Ulangi password baru"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-500">
                  Gunakan minimal 6 karakter dan jangan membagikan akun kepada pengguna lain.
                </p>

                <Button
                  type="submit"
                  isLoading={resetPassword.isPending}
                  className="h-11 w-full text-sm font-bold sm:w-auto sm:px-5"
                >
                  <KeyRound className="h-4 w-4" />
                  Simpan Password
                </Button>
              </div>
            </form>
          </section>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Server className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                Status Backend
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Health check otomatis setiap 30 detik.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  API Status
                </p>
                <p className="mt-1 font-extrabold text-slate-950">
                  {healthQuery.isLoading
                    ? "Memeriksa..."
                    : isHealthOk
                      ? "Terhubung"
                      : "Tidak Terhubung"}
                </p>
              </div>

              {isHealthOk ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              ) : (
                <XCircle className="h-7 w-7 text-red-600" />
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white px-4 py-3">
                <p className="text-xs font-bold text-slate-500">Service</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {getHealthStatus(health)}
                </p>
              </div>

              <div className="rounded-xl bg-white px-4 py-3">
                <p className="text-xs font-bold text-slate-500">Database</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {getDatabaseStatus(health)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => healthQuery.refetch()}
              disabled={healthQuery.isFetching}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={
                  healthQuery.isFetching
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh Status
            </button>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
