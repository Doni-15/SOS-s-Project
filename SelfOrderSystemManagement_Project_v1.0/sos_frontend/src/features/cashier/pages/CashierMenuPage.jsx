import { CheckCircle2, RefreshCw, Search, Utensils, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { CashierShell } from "../components/CashierShell";
import { MenuStatusBadge } from "../../menu/components/MenuStatusBadge";
import { useMenuItems } from "../../menu/hooks/useMenuItems";
import { useUpdateMenuItem } from "../../menu/hooks/useMenuMutations";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { cn } from "../../../shared/utils/cn";

const statusOptions = [
  {
    value: "AVAILABLE",
    label: "Tersedia",
    actionLabel: "Tandai Tersedia",
    icon: CheckCircle2,
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100",
    activeClassName:
      "border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-100",
  },
  {
    value: "OUT_OF_STOCK",
    label: "Habis",
    actionLabel: "Tandai Habis",
    icon: XCircle,
    className:
      "border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100",
    activeClassName:
      "border-red-500 bg-red-600 text-white shadow-lg shadow-red-100",
  },
];

function getMenuItemsPayload(response) {
  const visited = new Set();

  function looksLikeMenuItems(value) {
    return (
      Array.isArray(value) &&
      value.some((item) => {
        if (!item || typeof item !== "object") return false;

        return (
          "name" in item ||
          "price" in item ||
          "availabilityStatus" in item ||
          "availability_status" in item
        );
      })
    );
  }

  function findMenuItems(value) {
    if (!value || typeof value !== "object") return [];

    if (visited.has(value)) return [];
    visited.add(value);

    if (looksLikeMenuItems(value)) {
      return value;
    }

    const preferredKeys = [
      "items",
      "menuItems",
      "menus",
      "data",
      "payload",
      "result",
      "results",
      "rows",
      "list",
    ];

    for (const key of preferredKeys) {
      if (key in value) {
        const found = findMenuItems(value[key]);
        if (found.length > 0) return found;
      }
    }

    for (const child of Object.values(value)) {
      const found = findMenuItems(child);
      if (found.length > 0) return found;
    }

    return [];
  }

  return findMenuItems(response);
}

function getCategoryName(item) {
  return item?.category?.name ?? item?.categoryName ?? item?.category_name ?? "-";
}

function getItemStatus(item) {
  return item?.availabilityStatus ?? item?.availability_status ?? "OUT_OF_STOCK";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function CashierMenuPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const menuItemsQuery = useMenuItems();
  const updateMenuMutation = useUpdateMenuItem();

  const menuItems = useMemo(
    () => getMenuItemsPayload(menuItemsQuery.data),
    [menuItemsQuery.data],
  );

  const filteredMenuItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return menuItems.filter((item) => {
      const status = getItemStatus(item);
      const name = String(item?.name ?? "").toLowerCase();
      const category = String(getCategoryName(item)).toLowerCase();

      const matchesKeyword =
        !keyword || name.includes(keyword) || category.includes(keyword);

      const matchesStatus = !statusFilter || status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [menuItems, searchKeyword, statusFilter]);

  const isUpdating = updateMenuMutation.isPending || updateMenuMutation.isLoading;

  const errorMessage =
    updateMenuMutation.error?.response?.data?.message ??
    updateMenuMutation.error?.message ??
    null;

  function handleUpdateAvailability(item, availabilityStatus) {
    if (!item?.id) return;

    const currentStatus = getItemStatus(item);

    if (currentStatus === availabilityStatus || isUpdating) {
      return;
    }

    updateMenuMutation.mutate({
      id: item.id,
      payload: { availabilityStatus },
    });
  }

  if (menuItemsQuery.isLoading) {
    return (
      <CashierShell
        title="Selamat datang, Kasir!"
        description="Perbarui status tersedia atau habis tanpa membuka fitur master data owner."
      >
        <LoadingState message="Memuat data menu..." />
      </CashierShell>
    );
  }

  if (menuItemsQuery.isError) {
    return (
      <CashierShell
        title="Selamat datang, Kasir!"
        description="Perbarui status tersedia atau habis tanpa membuka fitur master data owner."
      >
        <ErrorState
          title="Gagal memuat menu"
          description={
            menuItemsQuery.error?.message ??
            "Terjadi kesalahan saat mengambil data menu."
          }
        />
      </CashierShell>
    );
  }

  return (
    <CashierShell
      title="Selamat datang, Kasir!"
      description="Perbarui status tersedia atau habis tanpa membuka fitur master data owner."
    >
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Kelola Ketersediaan Menu
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              Atur Menu Tersedia atau Habis
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Kasir hanya dapat mengubah status operasional menu, tanpa akses tambah atau hapus menu.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-2xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-600">
            2 aksi kasir: Tersedia / Habis
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Cari nama menu atau kategori..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="">Semua Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="hidden grid-cols-[1.5fr_180px_220px_280px] bg-slate-50 px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-slate-500 lg:grid">
            <span>Menu</span>
            <span>Harga</span>
            <span>Status</span>
            <span className="text-right">Aksi Kasir</span>
          </div>

          {filteredMenuItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredMenuItems.map((item) => {
                const currentStatus = getItemStatus(item);

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_180px_220px_280px] lg:items-center lg:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 lg:hidden">
                          <Utensils className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            {getCategoryName(item)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm font-black text-slate-900">
                      {formatCurrency(item.price)}
                    </p>

                    <div>
                      <MenuStatusBadge status={currentStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:justify-end">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = currentStatus === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleUpdateAvailability(item, option.value)}
                            disabled={isActive || isUpdating}
                            className={cn(
                              "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60",
                              isActive ? option.activeClassName : option.className,
                            )}
                          >
                            {isUpdating && !isActive ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                            <span>{isActive ? option.label : option.actionLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Utensils className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900">
                Menu tidak ditemukan
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Coba ubah kata kunci pencarian atau filter status.
              </p>
            </div>
          )}
        </div>
      </section>
    </CashierShell>
  );
}
