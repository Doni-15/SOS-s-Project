import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { BackLink } from "../../../shared/components/BackLink";
import { Button } from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import { ROUTES } from "../../../shared/constants/appConfig";
import { AccessSummaryCard } from "../../users/components/AccessSummaryCard";
import {
  buildUserPayload,
  getUserDisplayName,
  getUserPhone,
} from "../../users/utils/userHelpers";
import { useUserDetail } from "../../users/hooks/useUserDetail";
import {
  useCreateUser,
  useResetUserPassword,
  useUpdateUser,
} from "../../users/hooks/useUserMutations";

function createEmptyUserForm() {
  return {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CASHIER",
    isActive: true,
  };
}

export function OwnerUserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const isEditing = Boolean(userId) && userId !== "new";

  const userDetailQuery = useUserDetail(userId);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();

  const [form, setForm] = useState(() => createEmptyUserForm());
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const selectedUser = userDetailQuery.data;

  const isLoading = isEditing && userDetailQuery.isLoading;
  const isSubmitting =
    createUser.isPending || updateUser.isPending || resetPassword.isPending;

  useEffect(() => {
    if (!isEditing) {
      const resetTimer = window.setTimeout(() => {
        setForm(createEmptyUserForm());
        setFormError("");
        setShowPassword(false);
      }, 0);

      const autofillResetTimer = window.setTimeout(() => {
        setForm(createEmptyUserForm());
      }, 150);

      return () => {
        window.clearTimeout(resetTimer);
        window.clearTimeout(autofillResetTimer);
      };
    }

    if (!selectedUser) {
      return undefined;
    }

    const hydrateTimer = window.setTimeout(() => {
      setForm({
        fullName: getUserDisplayName(selectedUser),
        username: selectedUser.username ?? "",
        email: selectedUser.email ?? "",
        phone: getUserPhone(selectedUser),
        password: "",
        confirmPassword: "",
        role: selectedUser.role ?? "CASHIER",
        isActive: selectedUser.isActive !== false,
      });

      setFormError("");
      setShowPassword(false);
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, [isEditing, selectedUser]);

  const pageTitle = isEditing ? "Edit Pengguna" : "Tambah Pengguna";

  const roleHint = useMemo(() => {
    if (form.role === "OWNER") {
      return "Pemilik dapat mengakses dashboard, laporan, analitik, menu, pengguna, dan pengaturan.";
    }

    return "Kasir dapat mengakses fitur operasional seperti order, transaksi, dan menu.";
  }, [form.role]);

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleBack = () => {
    navigate(ROUTES.ownerUsers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      setFormError("Nama lengkap wajib diisi.");
      return;
    }

    if (!form.username.trim()) {
      setFormError("Username wajib diisi.");
      return;
    }

    if (!isEditing && !form.password) {
      setFormError("Password wajib diisi saat membuat pengguna.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setFormError("Password minimal 6 karakter.");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setFormError("Password dan konfirmasi password tidak sama.");
      return;
    }

    try {
      const payload = buildUserPayload(form, {
        includePassword: !isEditing,
      });

      if (isEditing) {
        await updateUser.mutateAsync({
          id: userId,
          payload,
        });

        if (form.password) {
          await resetPassword.mutateAsync({
            id: userId,
            password: form.password,
          });
        }
      } else {
        await createUser.mutateAsync(payload);
      }

      navigate(ROUTES.ownerUsers);
    } catch (error) {
      setFormError(error?.message || "Pengguna gagal disimpan.");
    }
  };

  return (
    <DashboardShell
      title={pageTitle}
      description="Kelola akun pengguna yang dapat mengakses sistem Kedai Nusantara."
    >
      {isLoading ? <LoadingState message="Memuat data pengguna..." /> : null}

      {isEditing && userDetailQuery.isError ? (
        <ErrorState
          title="Pengguna gagal dimuat"
          message={userDetailQuery.error?.message || "Terjadi kesalahan saat mengambil data pengguna."}
          onRetry={userDetailQuery.refetch}
          isRetrying={userDetailQuery.isFetching}
        />
      ) : null}

      {!isLoading && !(isEditing && userDetailQuery.isError) ? (
        <div className="space-y-5">
          <BackLink onClick={handleBack}>
            Kembali ke daftar pengguna
          </BackLink>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 border-b border-slate-100 pb-4">
                <h2 className="text-base font-extrabold text-slate-950">
                  Informasi Pengguna
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi data akun dan pilih peran yang sesuai.
                </p>
              </div>

              {formError ? (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {formError}
                </div>
              ) : null}

              <form
                key={isEditing ? `edit-user-${userId}` : "create-user"}
                onSubmit={handleSubmit}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                className="space-y-4"
              >
                <div className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0" aria-hidden="true">
                  <input type="text" name="autofill_guard_identifier" autoComplete="username" tabIndex={-1} />
                  <input type="password" name="autofill_guard_secret" autoComplete="current-password" tabIndex={-1} />
                </div>
                <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
                  <label className="text-sm font-bold text-slate-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="staff_display_name"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    value={form.fullName}
                    onChange={updateField("fullName")}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="Masukkan nama lengkap"
                  />

                  <label className="text-sm font-bold text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="staff_account_identifier"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    value={form.username}
                    onChange={updateField("username")}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="Masukkan username"
                  />

                  <label className="text-sm font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    name="staff_contact_email"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    value={form.email}
                    onChange={updateField("email")}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="nama@email.com"
                  />

                  <label className="text-sm font-bold text-slate-700">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="staff_contact_phone"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    value={form.phone}
                    onChange={updateField("phone")}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="08xxxxxxxxxx"
                  />

                  <label className="text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <div>
                    <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="staff_new_secret"
                        autoComplete="new-password"
                        data-lpignore="true"
                        data-form-type="other"
                        value={form.password}
                        onChange={updateField("password")}
                        className="min-w-0 flex-1 text-sm font-semibold text-slate-700 outline-none"
                        placeholder={
                          isEditing
                            ? "Kosongkan jika tidak ingin mengubah password"
                            : "Masukkan password"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-slate-400 transition hover:text-slate-700"
                        aria-label="Tampilkan password"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {isEditing ? (
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Kosongkan password jika tidak ingin mengubahnya.
                      </p>
                    ) : null}
                  </div>

                  <label className="text-sm font-bold text-slate-700">
                    Konfirmasi Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="staff_new_secret_confirmation"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="Ulangi password"
                  />

                  <label className="text-sm font-bold text-slate-700">Peran</label>
                  <div>
                    <select
                      value={form.role}
                      onChange={updateField("role")}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="OWNER">Pemilik</option>
                      <option value="CASHIER">Kasir</option>
                    </select>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {roleHint}
                    </p>
                  </div>

                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <div>
                    <select
                      value={form.isActive ? "true" : "false"}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isActive: event.target.value === "true",
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="true">Aktif</option>
                      <option value="false">Nonaktif</option>
                    </select>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Nonaktifkan akun jika pengguna tidak lagi menggunakan sistem.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="h-11 w-full px-5 text-sm sm:w-auto"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Pengguna
                  </Button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </section>

            <AccessSummaryCard role={form.role} />
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
