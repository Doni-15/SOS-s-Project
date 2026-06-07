import { Edit3, Loader2, Plus, Power, Search, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "../../../shared/components/Button";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { EmptyState } from "../../../shared/components/EmptyState";
import { ROUTES } from "../../../shared/constants/appConfig";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import { formatDateTime } from "../../../shared/utils/formatters";
import { useAuth } from "../../auth/hooks/useAuth";
import { UserRoleBadge, UserStatusBadge } from "../../users/components/UserBadges";
import { useUsers } from "../../users/hooks/useUsers";
import { useUpdateUserStatus } from "../../users/hooks/useUserMutations";
import {
  getIsUserActive,
  getUserDisplayName,
  getUserLastActivityAt,
  isSameUser,
  sortUsersByRole,
} from "../../users/utils/userHelpers";

const ROLE_OPTIONS = [
  { value: "", label: "Semua Peran" },
  { value: "OWNER", label: "Pemilik" },
  { value: "CASHIER", label: "Kasir" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "true", label: "Aktif" },
  { value: "false", label: "Nonaktif" },
];

const USERS_PER_PAGE = 10;

export function OwnerUsersPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
  });
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [page, setPage] = useState(1);

  const updateUserStatus = useUpdateUserStatus();

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      role: filters.role || undefined,
      isActive:
        filters.isActive === ""
          ? undefined
          : filters.isActive === "true",
      page,
      limit: USERS_PER_PAGE,
    }),
    [filters, page],
  );

  const usersQuery = useUsers(queryParams);
  const rawUsers = usersQuery.data?.users ?? [];
  const sortedRawUsers = sortUsersByRole(rawUsers);
  const pagination = usersQuery.data?.pagination ?? {};

  const hasBackendPagination =
    Number(pagination.totalPages) > 1 || Number(pagination.total) > rawUsers.length;

  const users = hasBackendPagination
    ? sortedRawUsers
    : sortedRawUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  const totalUsers = Number(pagination.total) || sortedRawUsers.length;
  const totalPages = Math.max(
    Number(pagination.totalPages) || Math.ceil(totalUsers / USERS_PER_PAGE),
    1,
  );

  const ownerCount = sortedRawUsers.filter((user) => user.role === "OWNER").length;
  const cashierCount = sortedRawUsers.filter((user) => user.role === "CASHIER").length;

  const isStatusProcessing = updateUserStatus.isPending;
  const willDeactivate = getIsUserActive(statusTarget);

  const handleFilterChange = (field) => (event) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleAddUser = () => {
    navigate(ROUTES.ownerUserCreate);
  };

  const handleEditUser = (user) => {
    if (!isStatusProcessing) {
      navigate(ROUTES.ownerUserEditPath(user.id));
    }
  };

  const handleOpenStatusDialog = (user) => {
    setStatusError("");
    setStatusTarget(user);
  };

  const handleCloseStatusDialog = () => {
    if (!isStatusProcessing) {
      setStatusTarget(null);
      setStatusError("");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusTarget?.id) {
      return;
    }

    if (isSameUser(currentUser, statusTarget)) {
      setStatusError("Anda tidak dapat menonaktifkan akun yang sedang digunakan.");
      return;
    }

    setStatusError("");

    try {
      await updateUserStatus.mutateAsync({
        id: statusTarget.id,
        isActive: !getIsUserActive(statusTarget),
      });

      await usersQuery.refetch();
      setStatusTarget(null);
    } catch (error) {
      setStatusError(
        error?.message ||
          "Status pengguna gagal diperbarui. Silakan coba lagi.",
      );
    }
  };

  return (
    <DashboardShell
      title="Manajemen Akun Pengguna"
      description="Kelola akun owner dan kasir yang memiliki akses ke sistem."
      headerAction={
        <Button
          type="button"
          onClick={handleAddUser}
          disabled={isStatusProcessing}
          className="h-10 w-full px-4 text-sm font-bold sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      }
    >
      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={willDeactivate ? "Nonaktifkan pengguna?" : "Aktifkan pengguna?"}
        description={
          willDeactivate
            ? `Akun ${statusTarget?.username ?? ""} tidak akan dapat mengakses sistem sampai diaktifkan kembali.`
            : `Akun ${statusTarget?.username ?? ""} akan dapat mengakses sistem kembali.`
        }
        cancelLabel="Batal"
        confirmLabel={willDeactivate ? "Nonaktifkan" : "Aktifkan"}
        processingLabel={willDeactivate ? "Menonaktifkan..." : "Mengaktifkan..."}
        variant="danger"
        isProcessing={isStatusProcessing}
        errorMessage={statusError}
        onCancel={handleCloseStatusDialog}
        onConfirm={handleConfirmStatusChange}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                Daftar Pengguna
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Owner ditampilkan di bagian atas, kemudian kasir di bawahnya.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Owner: {ownerCount}
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Kasir: {cashierCount}
              </span>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_0.55fr_0.55fr]">
            <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={filters.search}
                onChange={handleFilterChange("search")}
                placeholder="Cari username atau nama pengguna..."
                disabled={isStatusProcessing}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
            </label>

            <select
              value={filters.role}
              onChange={handleFilterChange("role")}
              disabled={isStatusProcessing}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <select
              value={filters.isActive}
              onChange={handleFilterChange("isActive")}
              disabled={isStatusProcessing}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="p-5">
            <LoadingState message="Memuat data pengguna..." />
          </div>
        ) : null}

        {usersQuery.isError ? (
          <div className="p-5">
            <ErrorState
              title="Pengguna gagal dimuat"
              message={usersQuery.error?.message || "Terjadi kesalahan saat mengambil data pengguna."}
              onRetry={usersQuery.refetch}
              isRetrying={usersQuery.isFetching}
            />
          </div>
        ) : null}

        {!usersQuery.isLoading && !usersQuery.isError && !users.length ? (
          <div className="p-5">
            <EmptyState
              title="Belum ada pengguna"
              description="Data pengguna belum tersedia atau tidak cocok dengan filter yang dipilih."
              action={
                <Button
                  type="button"
                  onClick={handleAddUser}
                  className="mx-auto h-10 w-auto px-4 text-sm"
                >
                  <UserRoundPlus className="h-4 w-4" />
                  Tambah Pengguna
                </Button>
              }
            />
          </div>
        ) : null}

        {!usersQuery.isLoading && !usersQuery.isError && users.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-extrabold">Username</th>
                    <th className="px-5 py-3 font-extrabold">Nama</th>
                    <th className="px-5 py-3 font-extrabold">Peran</th>
                    <th className="px-5 py-3 font-extrabold">Status</th>
                    <th className="px-5 py-3 font-extrabold">Terakhir Aktivitas</th>
                    <th className="px-5 py-3 font-extrabold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => {
                    const isCurrentUser = isSameUser(currentUser, user);
                    const isRowProcessing =
                      isStatusProcessing && statusTarget?.id === user.id;

                    return (
                      <tr key={user.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-950">
                          {user.username}
                          {isCurrentUser ? (
                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                              Anda
                            </span>
                          ) : null}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {getUserDisplayName(user)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <UserRoleBadge role={user.role} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <UserStatusBadge isActive={getIsUserActive(user)} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDateTime(getUserLastActivityAt(user))}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditUser(user)}
                              disabled={isStatusProcessing}
                              className="rounded-xl bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Edit ${user.username}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!isCurrentUser) {
                                  handleOpenStatusDialog(user);
                                }
                              }}
                              disabled={isCurrentUser || isRowProcessing || isStatusProcessing}
                              title={
                                isCurrentUser
                                  ? "Akun yang sedang digunakan tidak dapat dinonaktifkan"
                                  : `${getIsUserActive(user) ? "Nonaktifkan" : "Aktifkan"} ${user.username}`
                              }
                              className={
                                isCurrentUser
                                  ? "cursor-not-allowed rounded-xl bg-slate-100 p-2 text-slate-300"
                                  : "rounded-xl bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              }
                              aria-label={`${getIsUserActive(user) ? "Nonaktifkan" : "Aktifkan"} ${user.username}`}
                            >
                              {isRowProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Menampilkan {users.length} dari {totalUsers} pengguna
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isStatusProcessing}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                <span className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages || isStatusProcessing}
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </DashboardShell>
  );
}
