import { Loader2, Plus, Save, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../../../shared/components/Button";
import { uploadApi } from "../../uploads/api/uploadApi";
import {
  useCreateMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
} from "../hooks/useMenuMutations";

const initialForm = {
  name: "",
  categoryId: "",
  price: "",
  description: "",
  availabilityStatus: "AVAILABLE",
  imageUrl: "",
};

function getCategoryId(item) {
  return item?.categoryId ?? item?.category?.id ?? "";
}

function getItemStatus(item) {
  return item?.availabilityStatus ?? item?.status ?? "AVAILABLE";
}

function buildPayload(form) {
  return {
    name: form.name.trim(),
    categoryId: form.categoryId || null,
    price: Number(form.price || 0),
    description: form.description.trim() || null,
    availabilityStatus: form.availabilityStatus,
    imageUrl: form.imageUrl || null,
  };
}

function getCreatedCategoryId(category) {
  return category?.id ?? category?.categoryId ?? category?.menuCategoryId ?? "";
}

export function MenuItemForm({
  categories = [],
  selectedItem,
  onCancelEdit,
  onFormChange,
  onSaved,
}) {
  const createMenuCategory = useCreateMenuCategory();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();

  const [localCategories, setLocalCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = Boolean(selectedItem?.id);
  const isCreatingCategory = createMenuCategory.isPending;
  const isSubmitting =
    createMenuItem.isPending ||
    updateMenuItem.isPending ||
    isUploading ||
    isCreatingCategory;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selectedItem) {
        setForm(initialForm);
        setFormError("");
        return;
      }

      setForm({
        name: selectedItem.name ?? "",
        categoryId: getCategoryId(selectedItem),
        price: String(selectedItem.price ?? selectedItem.unitPrice ?? ""),
        description: selectedItem.description ?? "",
        availabilityStatus: getItemStatus(selectedItem),
        imageUrl: selectedItem.imageUrl ?? selectedItem.image_url ?? "",
      });
      setFormError("");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedItem]);

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const activeCategories = useMemo(() => {
    const merged = [...categories, ...localCategories];
    const unique = new Map();

    merged.forEach((category) => {
      if (category?.id && category?.isActive !== false) {
        unique.set(category.id, category);
      }
    });

    return Array.from(unique.values());
  }, [categories, localCategories]);

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

    setFormError("");
  };

  const handleCreateCategory = async () => {
    const categoryName = newCategoryName.trim();

    if (!categoryName) {
      setCategoryError("Nama kategori wajib diisi.");
      return;
    }

    const isDuplicate = activeCategories.some(
      (category) =>
        String(category.name ?? "").toLowerCase() === categoryName.toLowerCase(),
    );

    if (isDuplicate) {
      setCategoryError("Kategori dengan nama tersebut sudah ada.");
      return;
    }

    try {
      setCategoryError("");

      const createdCategory = await createMenuCategory.mutateAsync({
        name: categoryName,
        isActive: true,
      });

      const createdCategoryId = getCreatedCategoryId(createdCategory);

      if (!createdCategoryId) {
        setCategoryError(
          "Kategori dibuat, tetapi ID kategori belum diterima dari backend.",
        );
        return;
      }

      const normalizedCategory = {
        ...createdCategory,
        id: createdCategoryId,
        name: createdCategory?.name ?? categoryName,
        isActive: createdCategory?.isActive ?? true,
      };

      setLocalCategories((current) => [...current, normalizedCategory]);
      setForm((current) => ({
        ...current,
        categoryId: createdCategoryId,
      }));
      setNewCategoryName("");
      setIsCategoryFormOpen(false);
    } catch (error) {
      setCategoryError(
        error?.message ||
          "Kategori gagal dibuat. Pastikan backend kategori sudah tersedia.",
      );
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 2MB.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const image = await uploadApi.uploadMenuImage(file);
      const imageUrl = image?.url ?? image?.imageUrl ?? image?.path ?? image;

      setForm((current) => ({
        ...current,
        imageUrl: imageUrl || "",
      }));
    } catch (error) {
      setFormError(error?.message || "Upload gambar gagal.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Nama menu wajib diisi.");
      return;
    }

    if (!form.categoryId) {
      setFormError("Kategori menu wajib dipilih atau dibuat terlebih dahulu.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setFormError("Harga menu harus lebih dari 0.");
      return;
    }

    try {
      const payload = buildPayload(form);

      if (isEditing) {
        await updateMenuItem.mutateAsync({
          id: selectedItem.id,
          payload,
        });
      } else {
        await createMenuItem.mutateAsync(payload);
        setForm(initialForm);
      }

      setFormError("");
      onSaved?.();
    } catch (error) {
      setFormError(error?.message || "Menu gagal disimpan.");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            {isEditing ? "Edit Menu" : "Tambah Menu"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lengkapi informasi menu dan tentukan kategori makanan.
          </p>
        </div>

        {onCancelEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isEditing ? "Batal edit" : "Tutup form"}
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {formError ? (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
          <label className="text-sm font-extrabold text-slate-700">
            Nama Menu
          </label>
          <input
            type="text"
            value={form.name}
            onChange={updateField("name")}
            disabled={isSubmitting}
            placeholder="Masukkan nama menu"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <label className="pt-3 text-sm font-extrabold text-slate-700">
            Kategori
          </label>

          <div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <select
                value={form.categoryId}
                onChange={updateField("categoryId")}
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">Pilih kategori menu</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setIsCategoryFormOpen((current) => !current);
                  setCategoryError("");
                }}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Kategori Baru
              </button>
            </div>

            {isCategoryFormOpen ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(event) => {
                      setNewCategoryName(event.target.value);
                      setCategoryError("");
                    }}
                    disabled={isSubmitting}
                    placeholder="Contoh: Makanan Berat, Minuman, Dessert"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isSubmitting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isCreatingCategory ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Simpan
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryFormOpen(false);
                      setNewCategoryName("");
                      setCategoryError("");
                    }}
                    disabled={isSubmitting}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Batal
                  </button>
                </div>

                {categoryError ? (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {categoryError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Kategori baru akan langsung dipilih untuk menu ini.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Pilih kategori yang tersedia atau buat kategori baru.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
          <label className="text-sm font-extrabold text-slate-700">
            Harga
          </label>
          <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-extrabold text-slate-500">
              Rp
            </span>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={updateField("price")}
              disabled={isSubmitting}
              placeholder="Masukkan harga"
              className="min-w-0 flex-1 px-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
          <label className="text-sm font-extrabold text-slate-700">
            Status
          </label>
          <select
            value={form.availabilityStatus}
            onChange={updateField("availabilityStatus")}
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="AVAILABLE">Tersedia</option>
            <option value="OUT_OF_STOCK">Habis</option>
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <label className="text-sm font-extrabold text-slate-700">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={updateField("description")}
            disabled={isSubmitting}
            rows={4}
            placeholder="Masukkan deskripsi menu"
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <label className="text-sm font-extrabold text-slate-700">
            Gambar Menu
          </label>

          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50">
              <Upload className="h-6 w-6 text-blue-700" />
              <span className="mt-2 text-sm font-extrabold text-slate-800">
                {isUploading ? "Mengunggah gambar..." : "Upload gambar menu"}
              </span>
              <span className="mt-1 text-xs font-semibold text-slate-500">
                Maksimal 2MB. Gunakan gambar yang jelas.
              </span>

              <input
                type="file"
                accept="image/*"
                disabled={isSubmitting}
                onChange={handleUploadImage}
                className="sr-only"
              />
            </label>

            {form.imageUrl ? (
              <input
                type="url"
                value={form.imageUrl}
                onChange={updateField("imageUrl")}
                disabled={isSubmitting}
                placeholder="URL gambar menu"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
          {onCancelEdit ? (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
          ) : null}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="h-11 w-full text-sm font-bold sm:w-auto sm:px-5"
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Simpan Perubahan" : "Simpan Menu"}
          </Button>
        </div>
      </form>
    </section>
  );
}
