import {
  ArrowLeft,
  Copy,
  Download,
  Edit3,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "../../../shared/components/Button";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { ErrorState, LoadingState } from "../../../shared/components/DataState";
import { EmptyState } from "../../../shared/components/EmptyState";
import { appConfig, ROUTES } from "../../../shared/constants/appConfig";
import { DashboardShell } from "../../../shared/layouts/DashboardShell";
import { cn } from "../../../shared/utils/cn";
import { formatDateTime } from "../../../shared/utils/formatters";
import { QRCodeCanvas } from "../../tables/components/QRCodeCanvas";
import {
  useActivateTable,
  useCreateTable,
  useDeactivateTable,
  useGenerateTableQrToken,
  useRevokeQrToken,
  useTableQrTokens,
  useTables,
  useUpdateTable,
} from "../../tables/hooks/useTables";

const initialTableForm = {
  tableNumber: "",
  label: "",
  isActive: true,
};

const initialQrForm = {
  revokeExistingActiveTokens: true,
  expiresAt: "",
};

function getTableLabel(table) {
  if (!table) {
    return "-";
  }

  return table.label || `Meja ${table.tableNumber}`;
}

function getOrderCount(table) {
  return Number(table?.counts?.orders ?? 0);
}

function getQrCount(table) {
  return Number(table?.counts?.qrTokens ?? 0);
}

function getActiveQrToken(table) {
  return table?.activeQrToken ?? null;
}

function getSafeDateTime(value) {
  return value ? formatDateTime(value) : "-";
}

function getCustomerOrderUrl(token) {
  const baseUrl = appConfig.publicOrderBaseUrl || window.location.origin;
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return `${normalizedBaseUrl}${ROUTES.publicOrder}?token=${encodeURIComponent(token)}`;
}

function getQrCanvasId(tableId) {
  return `owner-table-qr-${tableId || "draft"}`;
}

function downloadCanvas(canvasId, filename) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    return;
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printCanvas({ canvasId, title, subtitle }) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    return;
  }

  const imageUrl = canvas.toDataURL("image/png");
  const printWindow = window.open("", "_blank", "width=420,height=620");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, sans-serif;
            text-align: center;
            color: #0f172a;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 24px;
          }
          img {
            width: 280px;
            height: 280px;
            object-fit: contain;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 22px;
          }
          p {
            margin: 0 0 18px;
            color: #475569;
            font-size: 14px;
          }
          .hint {
            margin-top: 18px;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(subtitle)}</p>
          <img src="${imageUrl}" alt="QR Code" />
          <div class="hint">Scan QR untuk memulai pemesanan.</div>
        </div>
        <script>
          window.addEventListener("load", () => {
            window.print();
            window.close();
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-slate-100 text-slate-600 ring-slate-200",
      )}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function QrStatusBadge({ token, onClick, isSelected = false }) {
  const status = !token
    ? {
        label: "Belum ada QR aktif",
        className: "bg-amber-50 text-amber-700 ring-amber-100",
      }
    : token.isRevoked
      ? {
          label: "QR dicabut",
          className: "bg-red-50 text-red-700 ring-red-100",
        }
      : {
          label: "QR aktif",
          className: "bg-blue-50 text-blue-700 ring-blue-100",
        };

  const badgeClassName = cn(
    "inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1",
    status.className,
    isSelected ? "outline outline-2 outline-offset-2 outline-blue-300" : "",
  );

  if (!onClick) {
    return <span className={badgeClassName}>{status.label}</span>;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        badgeClassName,
        "cursor-pointer transition hover:scale-[1.03] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
      )}
      title="Klik untuk melihat QR meja"
      aria-label={`Lihat QR ${status.label}`}
    >
      {status.label}
    </button>
  );
}

function buildPreviewTable({ tableForm, selectedTable }) {
  if (selectedTable) {
    return {
      id: selectedTable.id,
      tableNumber: tableForm.tableNumber || selectedTable.tableNumber || "-",
      label: tableForm.label || selectedTable.label || "",
      isActive: tableForm.isActive,
      createdAt: selectedTable.createdAt,
      activeQrToken: selectedTable.activeQrToken,
    };
  }

  return {
    id: "",
    tableNumber: tableForm.tableNumber || "-",
    label: tableForm.label || "",
    isActive: tableForm.isActive,
    createdAt: null,
    activeQrToken: null,
  };
}

function TableFormSection({
  form,
  isEditMode,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            {isEditMode ? "Edit Meja" : "Tambah Meja"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lengkapi data meja. QR akan tampil di panel kanan setelah meja disimpan.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label="Tutup form meja"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-5">
        <div className="grid gap-5">
          <label className="grid gap-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
            <span className="text-sm font-bold text-slate-700">Nomor Meja</span>
            <input
              type="text"
              value={form.tableNumber}
              onChange={onChange("tableNumber")}
              placeholder="Contoh: A1, 01, VIP-1"
              required
              maxLength={20}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
            <span className="text-sm font-bold text-slate-700">Label Meja</span>
            <input
              type="text"
              value={form.label}
              onChange={onChange("label")}
              placeholder="Contoh: Dekat jendela, Area luar, VIP"
              maxLength={100}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={onChange("isActive")}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-bold text-slate-700">
                  Meja aktif
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  Meja aktif bisa digunakan pelanggan untuk memesan lewat QR.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar meja
          </button>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="h-11 w-full px-5 text-sm font-extrabold sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {isEditMode ? "Simpan Perubahan" : "Simpan & Generate QR"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function TableQrPreviewPanel({
  mode,
  table,
  generatedQrToken,
  qrForm,
  isGenerating,
  isRevoking,
  copyMessage,
  onQrFormChange,
  onGenerateQr,
  onCopyQrUrl,
  onDownloadQr,
  onPrintQr,
}) {
  const activeQrToken = generatedQrToken ?? getActiveQrToken(table);
  const activeRawToken = activeQrToken?.tokenValue ?? activeQrToken?.token;
  const hasGeneratedToken = Boolean(activeRawToken);
  const qrUrl = hasGeneratedToken ? getCustomerOrderUrl(activeRawToken) : "";
  const qrCanvasId = getQrCanvasId(table?.id || table?.tableNumber);
  const canGenerate = Boolean(table?.id && table?.isActive);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:self-start">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <QrCode className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            Preview QR Meja
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "form"
              ? "QR meja akan langsung muncul setelah meja berhasil disimpan."
              : "Pilih meja untuk melihat status QR dan membuat token baru."}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex min-h-[260px] items-center justify-center border-b border-slate-200 bg-white p-5">
          {qrUrl ? (
            <QRCodeCanvas value={qrUrl} canvasId={qrCanvasId} size={230} />
          ) : (
            <div className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <QrCode className="h-12 w-12 text-slate-400" />
              <p className="mt-3 text-sm font-extrabold text-slate-700">
                QR belum tersedia di layar ini
              </p>
              <p className="mt-1 max-w-xs text-xs font-semibold leading-5 text-slate-500">
                {table?.id
                  ? "Gunakan token QR aktif tersimpan atau klik Generate QR untuk membuat QR baru yang bisa dicetak."
                  : "Simpan meja terlebih dahulu agar QR dapat dibuat otomatis."}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                Nomor Meja
              </p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-950">
                {table?.tableNumber && table.tableNumber !== "-"
                  ? `Meja ${table.tableNumber}`
                  : "Meja baru"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {table?.label || "Label meja belum diisi"}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <StatusBadge isActive={Boolean(table?.isActive)} />
              <QrStatusBadge token={activeQrToken} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Dibuat
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {getSafeDateTime(table?.createdAt)}
              </p>
            </div>

            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Berlaku Sampai
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {getSafeDateTime(generatedQrToken?.expiresAt || activeQrToken?.expiresAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={qrForm.revokeExistingActiveTokens}
                onChange={(event) =>
                  onQrFormChange("revokeExistingActiveTokens", event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-bold text-blue-900">
                  Cabut QR aktif lama saat generate
                </span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-blue-700/80">
                  Disarankan aktif agar hanya satu QR valid per meja.
                </span>
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-blue-900">
                Masa berlaku, opsional
              </span>
              <input
                type="datetime-local"
                value={qrForm.expiresAt}
                onChange={(event) => onQrFormChange("expiresAt", event.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          {qrUrl ? (
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                Link Pelanggan
              </span>
              <input
                type="text"
                value={qrUrl}
                readOnly
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
              />
            </label>
          ) : null}

          {copyMessage ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {copyMessage}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Button
              type="button"
              onClick={onGenerateQr}
              isLoading={isGenerating}
              disabled={!canGenerate}
              className="h-11 w-full px-5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QrCode className="h-4 w-4" />
              {table?.id ? "Generate QR Baru" : "Simpan Meja Dulu"}
            </Button>

            {qrUrl ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={onCopyQrUrl}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>

                <button
                  type="button"
                  onClick={onDownloadQr}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh
                </button>

                <button
                  type="button"
                  onClick={onPrintQr}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
              </div>
            ) : null}

            {isRevoking ? (
              <p className="text-center text-xs font-semibold text-slate-500">
                Memproses perubahan QR...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}


function normalizeQrTokenList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.qrTokens)) return value.qrTokens;
  if (Array.isArray(value?.data?.qrTokens)) return value.data.qrTokens;
  if (Array.isArray(value?.recentQrTokens)) return value.recentQrTokens;
  if (Array.isArray(value?.qrTokens?.data)) return value.qrTokens.data;
  return [];
}

function isUsableQrToken(token) {
  return Boolean(token) && token.isRevoked !== true;
}

function getRawQrTokenValue(token) {
  return token?.tokenValue ?? token?.token ?? "";
}

export function OwnerTablesPage() {
  const [viewMode, setViewMode] = useState("list");
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
  });
  const [tableForm, setTableForm] = useState(initialTableForm);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [editingTableId, setEditingTableId] = useState("");
  const [generatedQrToken, setGeneratedQrToken] = useState(null);
  const [qrForm, setQrForm] = useState(initialQrForm);
  const [actionError, setActionError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Lanjutkan",
    variant: "default",
    onConfirm: null,
  });

  const tableQueryParams = useMemo(
    () => ({
      search: filters.search.trim() || undefined,
      isActive: filters.isActive || undefined,
      limit: 200,
    }),
    [filters],
  );

  const tablesQuery = useTables(tableQueryParams);
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const activateTable = useActivateTable();
  const deactivateTable = useDeactivateTable();
  const generateQrToken = useGenerateTableQrToken();
  const revokeQrToken = useRevokeQrToken();

  const tables = useMemo(
    () => tablesQuery.data?.tables ?? [],
    [tablesQuery.data],
  );

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0] ?? null,
    [selectedTableId, tables],
  );

  const formTable = useMemo(
    () =>
      editingTableId
        ? tables.find((table) => table.id === editingTableId) ?? selectedTable
        : null,
    [editingTableId, selectedTable, tables],
  );

  const previewTable =
    viewMode === "form"
      ? buildPreviewTable({ tableForm, selectedTable: formTable })
      : selectedTable;

  const qrTokensQuery = useTableQrTokens(selectedTable?.id, { limit: 20 });
  const qrTokens = useMemo(
    () => normalizeQrTokenList(qrTokensQuery.data),
    [qrTokensQuery.data],
  );

  const tableQrTokens = useMemo(
    () => [
      ...normalizeQrTokenList(selectedTable?.recentQrTokens),
      ...normalizeQrTokenList(selectedTable?.qrTokens),
    ],
    [selectedTable],
  );

  const selectedActiveQrToken = isUsableQrToken(selectedTable?.activeQrToken)
    ? selectedTable.activeQrToken
    : null;

  const resolvedActiveQrToken =
    qrTokens.find((token) => isUsableQrToken(token) && getRawQrTokenValue(token)) ??
    tableQrTokens.find(
      (token) => isUsableQrToken(token) && getRawQrTokenValue(token),
    ) ??
    (selectedActiveQrToken && getRawQrTokenValue(selectedActiveQrToken)
      ? selectedActiveQrToken
      : null) ??
    qrTokens.find(isUsableQrToken) ??
    tableQrTokens.find(isUsableQrToken) ??
    selectedActiveQrToken;

  const previewQrToken = generatedQrToken ?? resolvedActiveQrToken;
  const previewRawToken = getRawQrTokenValue(previewQrToken);
  const qrUrl = previewRawToken ? getCustomerOrderUrl(previewRawToken) : "";
  const qrCanvasId = getQrCanvasId(previewTable?.id || previewTable?.tableNumber);

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleTableFormChange = (field) => (event) => {
    const value = field === "isActive" ? event.target.checked : event.target.value;

    setTableForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleQrFormChange = (field, value) => {
    setQrForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingTableId("");
    setGeneratedQrToken(null);
    setTableForm(initialTableForm);
    setCopyMessage("");
    setActionError("");
  };

  const handleViewTableQr = (table) => {
    if (!table?.id) {
      return;
    }

    const activeToken = getActiveQrToken(table);

    setViewMode("list");
    setSelectedTableId(table.id);
    setEditingTableId("");
    setGeneratedQrToken(null);
    setTableForm(initialTableForm);
    setQrForm(initialQrForm);
    setActionError("");
    setCopyMessage(
      activeToken
        ? "QR meja dipilih. Preview, copy, unduh, atau print QR dari panel kanan."
        : "Meja dipilih. QR aktif belum tersedia, klik Generate QR untuk membuat QR.",
    );
  };

  const handleAddTable = () => {
    setViewMode("form");
    setEditingTableId("");
    setSelectedTableId("");
    setGeneratedQrToken(null);
    setTableForm(initialTableForm);
    setQrForm(initialQrForm);
    setCopyMessage("");
    setActionError("");
  };

  const handleEditTable = (table) => {
    setViewMode("form");
    setSelectedTableId(table.id);
    setEditingTableId(table.id);
    setGeneratedQrToken(null);
    setTableForm({
      tableNumber: table.tableNumber ?? "",
      label: table.label ?? "",
      isActive: Boolean(table.isActive),
    });
    setQrForm(initialQrForm);
    setCopyMessage("");
    setActionError("");
  };

  const buildQrPayload = () => ({
    revokeExistingActiveTokens: qrForm.revokeExistingActiveTokens,
    expiresAt: qrForm.expiresAt ? new Date(qrForm.expiresAt).toISOString() : null,
  });

  const handleGenerateQrForTable = async (table) => {
    if (!table?.id) {
      return null;
    }

    const qrToken = await generateQrToken.mutateAsync({
      tableId: table.id,
      payload: buildQrPayload(),
    });

    setGeneratedQrToken(qrToken);
    setCopyMessage("QR meja berhasil dibuat. Segera copy, unduh, atau print QR ini.");

    return qrToken;
  };

  const handleGenerateSelectedQr = async () => {
    const targetTable = viewMode === "form" ? formTable : selectedTable;

    if (!targetTable?.id) {
      return;
    }

    setActionError("");
    setCopyMessage("");

    try {
      await handleGenerateQrForTable(targetTable);
      await tablesQuery.refetch();

      if (qrTokensQuery.refetch) {
        await qrTokensQuery.refetch();
      }
    } catch (error) {
      setActionError(error?.message || "QR meja gagal dibuat.");
    }
  };

  const handleSubmitTable = async (event) => {
    event.preventDefault();
    setActionError("");
    setCopyMessage("");

    const payload = {
      tableNumber: tableForm.tableNumber.trim(),
      label: tableForm.label.trim() || null,
      isActive: tableForm.isActive,
    };

    try {
      const savedTable = editingTableId
        ? await updateTable.mutateAsync({ id: editingTableId, payload })
        : await createTable.mutateAsync(payload);

      const normalizedTable = {
        ...savedTable,
        tableNumber: savedTable?.tableNumber ?? payload.tableNumber,
        label: savedTable?.label ?? payload.label,
        isActive: Boolean(savedTable?.isActive ?? payload.isActive),
      };

      setSelectedTableId(normalizedTable.id);
      setEditingTableId(normalizedTable.id);
      setTableForm({
        tableNumber: normalizedTable.tableNumber ?? "",
        label: normalizedTable.label ?? "",
        isActive: Boolean(normalizedTable.isActive),
      });

      if (!editingTableId && normalizedTable.isActive) {
        await handleGenerateQrForTable(normalizedTable);
      } else if (!normalizedTable.isActive) {
        setGeneratedQrToken(null);
        setCopyMessage(
          "Meja tersimpan. Aktifkan meja terlebih dahulu untuk membuat QR.",
        );
      } else {
        setCopyMessage(
          "Perubahan meja tersimpan. Gunakan tombol Generate QR Baru jika ingin membuat QR baru.",
        );
      }

      await tablesQuery.refetch();
    } catch (error) {
      setActionError(error?.message || "Data meja gagal disimpan.");
    }
  };

  const runConfirm = ({ title, description, confirmLabel, variant, onConfirm }) => {
    setConfirmState({
      open: true,
      title,
      description,
      confirmLabel,
      variant,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmState((current) => ({
      ...current,
      open: false,
      onConfirm: null,
    }));
  };

  const handleConfirmAction = async () => {
    const action = confirmState.onConfirm;
    closeConfirm();

    if (action) {
      await action();
    }
  };

  const handleToggleTableStatus = (table) => {
    const nextAction = table.isActive ? deactivateTable : activateTable;

    runConfirm({
      title: table.isActive ? "Nonaktifkan meja?" : "Aktifkan meja?",
      description: table.isActive
        ? `Meja ${table.tableNumber} tidak bisa dipakai pelanggan sampai diaktifkan lagi. QR aktif juga akan dicabut oleh backend.`
        : `Meja ${table.tableNumber} akan bisa dipakai pelanggan kembali.`,
      confirmLabel: table.isActive ? "Nonaktifkan" : "Aktifkan",
      variant: table.isActive ? "danger" : "default",
      onConfirm: async () => {
        setActionError("");
        setCopyMessage("");

        try {
          await nextAction.mutateAsync(table.id);
          await tablesQuery.refetch();

          if (table.isActive && generatedQrToken?.tableId === table.id) {
            setGeneratedQrToken(null);
          }
        } catch (error) {
          setActionError(error?.message || "Status meja gagal diperbarui.");
        }
      },
    });
  };

  const handleRevokeQr = (qrToken) => {
    runConfirm({
      title: "Cabut QR token?",
      description:
        "QR lama tidak akan bisa digunakan lagi oleh pelanggan. Tindakan ini cocok jika QR bocor, rusak, atau perlu diganti.",
      confirmLabel: "Cabut QR",
      variant: "danger",
      onConfirm: async () => {
        setActionError("");
        setCopyMessage("");

        try {
          await revokeQrToken.mutateAsync(qrToken.id);

          if (generatedQrToken?.id === qrToken.id) {
            setGeneratedQrToken(null);
          }

          await qrTokensQuery.refetch();
          await tablesQuery.refetch();
        } catch (error) {
          setActionError(error?.message || "QR token gagal dicabut.");
        }
      },
    });
  };

  const handleCopyQrUrl = async () => {
    if (!qrUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopyMessage("Link QR berhasil disalin.");
    } catch {
      setCopyMessage("Link belum bisa disalin otomatis. Salin manual dari field link.");
    }
  };

  const handleDownloadQr = () => {
    if (!previewTable) {
      return;
    }

    downloadCanvas(qrCanvasId, `qr-meja-${previewTable.tableNumber || "baru"}.png`);
  };

  const handlePrintQr = () => {
    if (!previewTable) {
      return;
    }

    printCanvas({
      canvasId: qrCanvasId,
      title:
        previewTable.tableNumber && previewTable.tableNumber !== "-"
          ? `Meja ${previewTable.tableNumber}`
          : "Meja Baru",
      subtitle: getTableLabel(previewTable),
    });
  };

  const isTableSubmitting = createTable.isPending || updateTable.isPending;
  const isStatusUpdating = activateTable.isPending || deactivateTable.isPending;
  const isQrUpdating = generateQrToken.isPending || revokeQrToken.isPending;

  return (
    <DashboardShell
      title="Meja & QR"
      description="Kelola meja dan generate QR pelanggan untuk memulai self-order."
      headerAction={
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "list" ? (
            <Button
              type="button"
              onClick={handleAddTable}
              className="h-10 w-auto px-4 text-sm font-extrabold"
            >
              <Plus className="h-4 w-4" />
              Tambah Meja
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          )}

          <Button
            type="button"
            onClick={() => {
              tablesQuery.refetch();

              if (qrTokensQuery.refetch) {
                qrTokensQuery.refetch();
              }
            }}
            isLoading={tablesQuery.isFetching || qrTokensQuery.isFetching}
            className="h-10 w-auto px-4 text-sm font-extrabold"
          >
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </Button>
        </div>
      }
    >
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        cancelLabel="Batal"
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onCancel={closeConfirm}
        onConfirm={handleConfirmAction}
      />

      {actionError ? (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {actionError}
        </div>
      ) : null}

      {viewMode === "form" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <TableFormSection
            form={tableForm}
            isEditMode={Boolean(editingTableId)}
            isSubmitting={isTableSubmitting}
            onChange={handleTableFormChange}
            onSubmit={handleSubmitTable}
            onCancel={handleBackToList}
          />

          <TableQrPreviewPanel
            mode="form"
            table={previewTable}
            generatedQrToken={generatedQrToken}
            qrForm={qrForm}
            isGenerating={generateQrToken.isPending}
            isRevoking={revokeQrToken.isPending}
            copyMessage={copyMessage}
            onQrFormChange={handleQrFormChange}
            onGenerateQr={handleGenerateSelectedQr}
            onCopyQrUrl={handleCopyQrUrl}
            onDownloadQr={handleDownloadQr}
            onPrintQr={handlePrintQr}
          />
        </div>
      ) : null}

      {viewMode === "list" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950">
                    Daftar Meja
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pilih meja untuk melihat QR aktif, riwayat QR, dan opsi generate.
                  </p>
                </div>

                <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                  {tables.length} meja tampil
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px]">
                <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    value={filters.search}
                    onChange={handleFilterChange("search")}
                    placeholder="Cari nomor atau label meja..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>

                <select
                  value={filters.isActive}
                  onChange={handleFilterChange("isActive")}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>

            {tablesQuery.isLoading ? (
              <div className="p-5">
                <LoadingState message="Memuat meja..." />
              </div>
            ) : null}

            {tablesQuery.isError ? (
              <div className="p-5">
                <ErrorState
                  title="Meja gagal dimuat"
                  message={
                    tablesQuery.error?.message ||
                    "Terjadi kesalahan saat mengambil data meja."
                  }
                  onRetry={tablesQuery.refetch}
                  isRetrying={tablesQuery.isFetching}
                />
              </div>
            ) : null}

            {!tablesQuery.isLoading && !tablesQuery.isError && !tables.length ? (
              <div className="p-5">
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10">
                  <EmptyState
                    title="Belum ada meja"
                    description="Tambahkan meja pertama agar owner dapat generate QR pelanggan."
                  />
                </div>
              </div>
            ) : null}

            {!tablesQuery.isLoading && !tablesQuery.isError && tables.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-extrabold">Meja</th>
                      <th className="px-5 py-3 font-extrabold">Status</th>
                      <th className="px-5 py-3 font-extrabold">QR</th>
                      <th className="px-5 py-3 font-extrabold">Order</th>
                      <th className="px-5 py-3 font-extrabold">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {tables.map((table) => {
                      const isSelected = selectedTable?.id === table.id;

                      return (
                        <tr
                          key={table.id}
                          className={cn(
                            "transition hover:bg-slate-50",
                            isSelected ? "bg-blue-50/50" : "",
                          )}
                        >
                          <td className="min-w-[220px] px-5 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTableId(table.id);
                                setGeneratedQrToken(null);
                                setCopyMessage("");
                              }}
                              className="text-left"
                            >
                              <p className="font-extrabold text-blue-800">
                                Meja {table.tableNumber}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {getTableLabel(table)}
                              </p>
                            </button>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <StatusBadge isActive={table.isActive} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <QrStatusBadge
                                token={getActiveQrToken(table)}
                                isSelected={selectedTable?.id === table.id}
                                onClick={() => handleViewTableQr(table)}
                              />
                              <span className="text-xs font-semibold text-slate-500">
                                {getQrCount(table)} token
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                            {getOrderCount(table)} order
                          </td>

                          <td className="min-w-[300px] px-5 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditTable(table)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleTableStatus(table)}
                                disabled={isStatusUpdating}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {table.isActive ? (
                                  <PowerOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Power className="h-3.5 w-3.5" />
                                )}
                                {table.isActive ? "Nonaktifkan" : "Aktifkan"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTableId(table.id);
                                  setGeneratedQrToken(null);
                                  setCopyMessage("");
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                QR
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <TableQrPreviewPanel
              mode="list"
              table={selectedTable}
              generatedQrToken={generatedQrToken}
              qrForm={qrForm}
              isGenerating={generateQrToken.isPending}
              isRevoking={revokeQrToken.isPending}
              copyMessage={copyMessage}
              onQrFormChange={handleQrFormChange}
              onGenerateQr={handleGenerateSelectedQr}
              onCopyQrUrl={handleCopyQrUrl}
              onDownloadQr={handleDownloadQr}
              onPrintQr={handlePrintQr}
            />

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-extrabold text-slate-950">
                  Riwayat QR Token
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Token mentah tidak ditampilkan ulang oleh backend.
                </p>
              </div>

              {qrTokensQuery.isLoading ? (
                <div className="p-5">
                  <LoadingState message="Memuat QR token..." />
                </div>
              ) : null}

              {qrTokensQuery.isError ? (
                <div className="p-5">
                  <ErrorState
                    title="QR token gagal dimuat"
                    message={
                      qrTokensQuery.error?.message ||
                      "Terjadi kesalahan saat mengambil QR token."
                    }
                    onRetry={qrTokensQuery.refetch}
                    isRetrying={qrTokensQuery.isFetching}
                  />
                </div>
              ) : null}

              {!qrTokensQuery.isLoading && !qrTokensQuery.isError && !qrTokens.length ? (
                <div className="p-5">
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8">
                    <EmptyState
                      title="Belum ada riwayat QR"
                      description="Generate QR pertama untuk meja ini."
                    />
                  </div>
                </div>
              ) : null}

              {!qrTokensQuery.isLoading && !qrTokensQuery.isError && qrTokens.length ? (
                <div className="divide-y divide-slate-100">
                  {qrTokens.map((qrToken) => (
                    <div key={qrToken.id} className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <QrStatusBadge token={qrToken} />
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            Dibuat: {getSafeDateTime(qrToken.createdAt)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Berlaku sampai: {getSafeDateTime(qrToken.expiresAt)}
                          </p>
                          {qrToken.revokedAt ? (
                            <p className="mt-1 text-xs font-semibold text-red-600">
                              Dicabut: {getSafeDateTime(qrToken.revokedAt)}
                            </p>
                          ) : null}
                        </div>

                        {!qrToken.isRevoked ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeQr(qrToken)}
                            disabled={revokeQrToken.isPending}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {revokeQrToken.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <PowerOff className="h-3.5 w-3.5" />
                            )}
                            Cabut
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {isQrUpdating ? (
              <p className="text-center text-xs font-semibold text-slate-500">
                Memperbarui data QR...
              </p>
            ) : null}
          </aside>
        </div>
      ) : null}
    </DashboardShell>
  );
}
