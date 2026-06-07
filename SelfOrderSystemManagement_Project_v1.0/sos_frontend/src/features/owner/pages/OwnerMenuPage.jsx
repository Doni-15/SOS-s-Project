import {
  Edit3,
  ImageOff,
  Loader2,
  Plus,
  Search,
  Trash2,
  Utensils,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { BackLink } from "../../../shared/components/BackLink";
import { Button } from "../../../shared/components/Button";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { EmptyState } from "../../../shared/components/EmptyState";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import { formatCurrency } from "../../../shared/utils/formatters";
import { MenuItemForm } from "../../menu/components/MenuItemForm";
import { MenuStatusBadge } from "../../menu/components/MenuStatusBadge";
import { useMenuCategories } from "../../menu/hooks/useMenuCategories";
import { useMenuItems } from "../../menu/hooks/useMenuItems";
import { useDeleteMenuItem } from "../../menu/hooks/useMenuMutations";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "AVAILABLE", label: "Tersedia" },
  { value: "OUT_OF_STOCK", label: "Habis" },
];

const MENU_PER_PAGE = 10;

const emptyFormPreview = {
  name: "",
  categoryId: "",
  price: "",
  description: "",
  availabilityStatus: "AVAILABLE",
  imageUrl: "",
};

function getCategoryName(item) {
  return item?.category?.name ?? item?.categoryName ?? "-";
}

function getCategoryId(item) {
  return item?.categoryId ?? item?.category?.id ?? "";
}

function getStatus(item) {
  return item?.availabilityStatus ?? item?.status ?? "AVAILABLE";
}

function getImageUrl(item) {
  return item?.imageUrl ?? item?.image_url ?? item?.image ?? "";
}

function getPrice(item) {
  return Number(item?.price ?? item?.unitPrice ?? 0);
}

function sortMenuItems(items = []) {
  return [...items].sort((a, b) => {
    const orderA = Number(a?.displayOrder ?? 999);
    const orderB = Number(b?.displayOrder ?? 999);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
  });
}

function getCategoryNameFromId(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.name ?? "";
}

function buildPreviewFromForm(form, categories) {
  return {
    id: "form-preview",
    name: form.name || "Nama menu",
    categoryId: form.categoryId,
    categoryName:
      getCategoryNameFromId(categories, form.categoryId) || "Belum memilih kategori",
    price: Number(form.price || 0),
    description:
      form.description || "Deskripsi menu akan tampil di area preview ini.",
    availabilityStatus: form.availabilityStatus || "AVAILABLE",
    imageUrl: form.imageUrl || "",
  };
}

function buildPreviewFromItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    name: item.name || "Nama menu",
    categoryId: getCategoryId(item),
    categoryName: getCategoryName(item),
    price: getPrice(item),
    description: item.description || "Tidak ada deskripsi menu.",
    availabilityStatus: getStatus(item),
    imageUrl: getImageUrl(item),
  };
}

function MenuPreviewPanel({
  item,
  mode,
  onEdit,
  onDelete,
  isDeleting,
  canManage = false,
}) {
  if (!item) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Utensils className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-950">
              Preview Menu
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pilih salah satu menu untuk melihat detailnya.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <ImageOff className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-bold text-slate-600">
            Belum ada menu dipilih
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Utensils className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Preview Menu
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "form"
              ? "Pratinjau dari data yang sedang diisi."
              : "Detail menu yang dipilih dari daftar."}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-slate-400">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-slate-950">
                {item.name}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {item.categoryName}
              </p>
            </div>

            <MenuStatusBadge status={item.availabilityStatus} />
          </div>

          <p className="text-2xl font-extrabold text-blue-700">
            {formatCurrency(item.price)}
          </p>

          <p className="text-sm leading-6 text-slate-600">
            {item.description}
          </p>
        </div>
      </div>

      {canManage ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={onEdit}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Edit3 className="h-4 w-4" />
            Edit Menu
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Hapus Menu
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export function OwnerMenuPage() {
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    availabilityStatus: "",
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [formPreview, setFormPreview] = useState(emptyFormPreview);
  const [viewMode, setViewMode] = useState("list");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      categoryId: filters.categoryId || undefined,
      availabilityStatus: filters.availabilityStatus || undefined,
      limit: 100,
    }),
    [filters],
  );

  const categoriesQuery = useMenuCategories();
  const menuItemsQuery = useMenuItems(queryParams);
  const deleteMenuItem = useDeleteMenuItem();

  const categories = categoriesQuery.data ?? [];
  const rawMenuItems = menuItemsQuery.data?.menuItems ?? [];
  const sortedMenuItems = sortMenuItems(rawMenuItems);

  const totalMenu = sortedMenuItems.length;
  const totalPages = Math.max(Math.ceil(totalMenu / MENU_PER_PAGE), 1);
  const menuItems = sortedMenuItems.slice(
    (page - 1) * MENU_PER_PAGE,
    page * MENU_PER_PAGE,
  );

  const availableCount = sortedMenuItems.filter(
    (item) => getStatus(item) === "AVAILABLE",
  ).length;
  const outOfStockCount = sortedMenuItems.filter(
    (item) => getStatus(item) === "OUT_OF_STOCK",
  ).length;
  const activeCategoryCount = categories.filter(
    (category) => category?.isActive !== false,
  ).length;

  const isLoading = categoriesQuery.isLoading || menuItemsQuery.isLoading;
  const isError = categoriesQuery.isError || menuItemsQuery.isError;
  const isDeleting = deleteMenuItem.isPending;
  const isFormMode = viewMode === "form";

  const activePreviewSource = previewTarget ?? sortedMenuItems[0] ?? null;
  const listPreviewItem = buildPreviewFromItem(activePreviewSource);
  const formPreviewItem = buildPreviewFromForm(formPreview, categories);
  const currentPreviewItem = isFormMode ? formPreviewItem : listPreviewItem;

  const handleFormPreviewChange = useCallback((nextForm) => {
    setFormPreview(nextForm);
  }, []);

  const handleFilterChange = (field) => (event) => {
    setPage(1);
    setPreviewTarget(null);
    setFilters((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleOpenCreateForm = () => {
    setSelectedItem(null);
    setFormPreview(emptyFormPreview);
    setViewMode("form");
  };

  const handleOpenEditForm = (item) => {
    if (isDeleting || !item) {
      return;
    }

    setSelectedItem(item);
    setFormPreview({
      name: item.name ?? "",
      categoryId: getCategoryId(item),
      price: String(item.price ?? item.unitPrice ?? ""),
      description: item.description ?? "",
      availabilityStatus: getStatus(item),
      imageUrl: getImageUrl(item),
    });
    setViewMode("form");
  };

  const handleBackToList = () => {
    if (isDeleting) {
      return;
    }

    setSelectedItem(null);
    setFormPreview(emptyFormPreview);
    setViewMode("list");
  };

  const handleSaved = async () => {
    await menuItemsQuery.refetch();
    handleBackToList();
  };

  const handleOpenDeleteDialog = (item) => {
    setDeleteError("");
    setDeleteTarget(item);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
      setDeleteError("");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setDeleteError("");

    try {
      await deleteMenuItem.mutateAsync(deleteTarget.id);
      await menuItemsQuery.refetch();

      if (previewTarget?.id === deleteTarget.id) {
        setPreviewTarget(null);
      }

      if (selectedItem?.id === deleteTarget.id) {
        handleBackToList();
      }

      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error?.message || "Menu gagal dihapus. Silakan coba lagi.");
    }
  };

  const refetchAll = () => {
    categoriesQuery.refetch();
    menuItemsQuery.refetch();
  };

  return (
    <DashboardShell
      title="Manajemen Menu"
      description={
        isFormMode
          ? "Lengkapi data menu dan lihat preview sebelum disimpan."
          : "Kelola daftar menu, kategori, harga, gambar, dan status ketersediaan."
      }
      headerAction={
        !isFormMode ? (
          <Button
            type="button"
            onClick={handleOpenCreateForm}
            disabled={isDeleting}
            className="h-10 w-full px-4 text-sm font-bold sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Tambah Menu
          </Button>
        ) : null
      }
    >
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus menu?"
        description={`Menu ${deleteTarget?.name ?? ""} akan dihapus dari daftar menu aktif.`}
        cancelLabel="Batal"
        confirmLabel="Hapus"
        processingLabel="Menghapus..."
        variant="danger"
        isProcessing={isDeleting}
        errorMessage={deleteError}
        onCancel={handleCloseDeleteDialog}
        onConfirm={handleDelete}
      />

      {isFormMode ? (
        <div>
          <div className="mb-5">
            <BackLink onClick={handleBackToList}>
              Kembali ke daftar menu
            </BackLink>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <MenuItemForm
            categories={categories}
            selectedItem={selectedItem}
            onCancelEdit={handleBackToList}
            onFormChange={handleFormPreviewChange}
            onSaved={handleSaved}
          />

            <MenuPreviewPanel item={currentPreviewItem} mode="form" />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950">
                    Daftar Menu
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pilih menu untuk melihat preview di panel kanan.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Menu: {totalMenu}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Tersedia: {availableCount}
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    Habis: {outOfStockCount}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_0.6fr_0.55fr]">
                <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    value={filters.search}
                    onChange={handleFilterChange("search")}
                    placeholder="Cari nama menu..."
                    disabled={isDeleting}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />
                </label>

                <select
                  value={filters.categoryId}
                  onChange={handleFilterChange("categoryId")}
                  disabled={isDeleting}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.availabilityStatus}
                  onChange={handleFilterChange("availabilityStatus")}
                  disabled={isDeleting}
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

            {isLoading ? (
              <div className="p-5">
                <LoadingState message="Memuat data menu..." />
              </div>
            ) : null}

            {isError ? (
              <div className="p-5">
                <ErrorState
                  title="Menu gagal dimuat"
                  message={
                    categoriesQuery.error?.message ||
                    menuItemsQuery.error?.message ||
                    "Terjadi kesalahan saat mengambil data menu."
                  }
                  onRetry={refetchAll}
                  isRetrying={categoriesQuery.isFetching || menuItemsQuery.isFetching}
                />
              </div>
            ) : null}

            {!isLoading && !isError && !menuItems.length ? (
              <div className="p-5">
                <EmptyState
                  title="Belum ada menu"
                  description="Data menu belum tersedia atau tidak cocok dengan filter yang dipilih."
                  action={
                    <Button
                      type="button"
                      onClick={handleOpenCreateForm}
                      className="mx-auto h-10 w-auto px-4 text-sm"
                    >
                      <Utensils className="h-4 w-4" />
                      Tambah Menu
                    </Button>
                  }
                />
              </div>
            ) : null}

            {!isLoading && !isError && menuItems.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-extrabold">Menu</th>
                        <th className="px-5 py-3 font-extrabold">Kategori</th>
                        <th className="px-5 py-3 font-extrabold">Harga</th>
                        <th className="px-5 py-3 font-extrabold">Status</th>
                        <th className="px-5 py-3 font-extrabold">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {menuItems.map((item) => {
                        const imageUrl = getImageUrl(item);
                        const isActivePreview =
                          (activePreviewSource?.id ?? "") === item.id;
                        const isRowDeleting =
                          isDeleting && deleteTarget?.id === item.id;

                        return (
                          <tr
                            key={item.id}
                            onClick={() => setPreviewTarget(item)}
                            className={
                              isActivePreview
                                ? "cursor-pointer bg-blue-50/60 transition hover:bg-blue-50"
                                : "cursor-pointer transition hover:bg-slate-50"
                            }
                          >
                            <td className="min-w-[280px] px-5 py-4">
                              <div className="flex items-center gap-3">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.name}
                                    className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                                    <Utensils className="h-5 w-5" />
                                  </div>
                                )}

                                <div>
                                  <p className="font-extrabold text-slate-950">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 max-w-[420px] truncate text-xs font-semibold text-slate-500">
                                    {item.description || "Tidak ada deskripsi"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {getCategoryName(item)}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 font-extrabold text-slate-950">
                              {formatCurrency(getPrice(item))}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <MenuStatusBadge status={getStatus(item)} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEditForm(item);
                                  }}
                                  disabled={isDeleting}
                                  className="rounded-xl bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={`Edit ${item.name}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenDeleteDialog(item);
                                  }}
                                  disabled={isDeleting}
                                  className="rounded-xl bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  aria-label={`Hapus ${item.name}`}
                                >
                                  {isRowDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
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
                    Menampilkan {menuItems.length} dari {totalMenu} menu ·{" "}
                    {activeCategoryCount} kategori aktif
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || isDeleting}
                      onClick={() =>
                        setPage((current) => Math.max(current - 1, 1))
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>

                    <span className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                      {page}
                    </span>

                    <button
                      type="button"
                      disabled={page >= totalPages || isDeleting}
                      onClick={() =>
                        setPage((current) => Math.min(current + 1, totalPages))
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </section>

          <MenuPreviewPanel
            item={currentPreviewItem}
            mode="list"
            canManage={Boolean(activePreviewSource)}
            isDeleting={isDeleting}
            onEdit={() => handleOpenEditForm(activePreviewSource)}
            onDelete={() => handleOpenDeleteDialog(activePreviewSource)}
          />
        </div>
      )}
    </DashboardShell>
  );
}
