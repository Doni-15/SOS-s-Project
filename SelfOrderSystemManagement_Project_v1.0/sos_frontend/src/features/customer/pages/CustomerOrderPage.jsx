import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Clock3,
  Loader2,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Timer,
  UserRound,
  Utensils,
} from "lucide-react";
import { useSearchParams } from "react-router";

import { cn } from "../../../shared/utils/cn";
import { CustomerCartPanel } from "../components/CustomerCartPanel";
import { CustomerMenuCard } from "../components/CustomerMenuCard";
import { CustomerOrderTracker } from "../components/CustomerOrderTracker";
import { CustomerPublicShell } from "../components/CustomerPublicShell";
import {
  addCartItem,
  buildSubmitOrderPayload,
  clearCustomerTrackingSession,
  decreaseCartItem,
  formatCurrency,
  getCartItemCount,
  getCartTotal,
  getItemQuantity,
  getSavedCustomerTrackingSession,
  getTableLabel,
  removeCartItem,
  saveCustomerTrackingSession,
  updateCartItemNote,
} from "../utils/customerOrderHelpers";
import {
  useCustomerOrderSession,
  useCustomerOrderTracking,
  useCustomerPublicMenu,
  useSubmitCustomerOrder,
} from "../hooks/useCustomerOrder";

function CustomerStateCard({ title, description, tone = "blue", action }) {
  const toneClassName = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div
          className={cn(
            "mx-auto grid h-16 w-16 place-items-center rounded-3xl ring-1",
            toneClassName[tone],
          )}
        >
          {tone === "red" ? (
            <AlertCircle size={32} />
          ) : (
            <Loader2 className="animate-spin" size={32} />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </section>
    </main>
  );
}

function WelcomeBenefit({ icon: Icon, title, description, tone = "blue" }) {
  const toneClassName = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <div className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/5">
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1",
          toneClassName[tone],
        )}
      >
        <Icon size={23} />
      </div>
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function WelcomeStep({ table, onStart, isMenuLoading }) {
  return (
    <CustomerPublicShell table={table}>
      <section className="px-5 py-7">
        <div className="grid gap-6">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100">
              <Sparkles size={15} />
              QR Berhasil
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Pesan menu langsung dari{" "}
              <span className="text-blue-700">{getTableLabel(table)}</span>
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-500">
              Tidak perlu antre. Pilih menu favorit, kirim ke kasir, lalu pantau
              status pesanan secara real-time dari halaman ini.
            </p>

            <button
              type="button"
              onClick={onStart}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-blue-700 px-6 py-4 text-lg font-black text-white shadow-xl shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <UserRound size={24} />
              Mulai Pesan Sekarang
              <ArrowRight size={24} />
            </button>

            {isMenuLoading ? (
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Menu sedang disiapkan...
              </p>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] bg-white p-5 shadow-2xl shadow-blue-950/10 ring-1 ring-slate-200">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100" />
            <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-emerald-100" />

            <div className="relative rounded-[1.75rem] bg-white p-6 text-center ring-1 ring-slate-100">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blue-700 text-white shadow-2xl shadow-blue-700/25">
                <CheckCircle2 size={56} />
              </div>

              <div className="mx-auto mt-5 w-fit rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-200">
                {getTableLabel(table)}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <p className="text-xl font-black text-blue-700">1</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Isi nama
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <p className="text-xl font-black text-blue-700">2</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Pilih menu
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <p className="text-xl font-black text-blue-700">3</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <WelcomeBenefit
            icon={Utensils}
            title="Menu Digital"
            description="Pilih menu tanpa antre."
          />
          <WelcomeBenefit
            icon={Timer}
            title="Tracking Real-time"
            description="Pantau status pesanan."
            tone="emerald"
          />
          <WelcomeBenefit
            icon={ShieldCheck}
            title="Aman & Mudah"
            description="Pesanan masuk ke kasir."
            tone="amber"
          />
        </div>
      </section>
    </CustomerPublicShell>
  );
}

function IdentityStep({ table, customerName, onChangeName, onNext }) {
  const canContinue = customerName.trim().length > 0;

  return (
    <CustomerPublicShell table={table}>
      <section className="flex min-h-[calc(100vh-112px)] items-center justify-center px-5 py-8">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-950/10 ring-1 ring-slate-200">
          <div className="bg-white p-6">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-700 text-white shadow-xl shadow-blue-700/20">
              <UserRound size={32} />
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
              <BadgeCheck size={15} />
              Langkah 1 dari 3
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Siapa nama pemesannya?
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nama ini hanya dipakai agar kasir mudah memanggil pesananmu.
            </p>
          </div>

          <div className="p-6">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Nama Pemesan
              </span>
              <input
                autoFocus
                value={customerName}
                onChange={(event) => onChangeName(event.target.value)}
                maxLength={100}
                placeholder="Contoh: Andi / Ibu Rina"
                className="mt-2 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-base font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <button
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-slate-950 px-6 py-4 text-base font-black text-white shadow-xl shadow-blue-700/20 transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              Lanjut Pilih Menu
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </section>
    </CustomerPublicShell>
  );
}

function CategoryChips({ categories, activeCategoryId, onChange }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
      <div className="flex min-w-max gap-3 pb-1">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black ring-1 transition",
            activeCategoryId === "all"
              ? "bg-blue-700 text-white ring-blue-700 shadow-lg shadow-blue-700/20"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
          )}
        >
          <Utensils size={18} />
          Semua
        </button>

        {categories.map((category) => {
          const categoryId = category.id ?? category.name;

          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => onChange(categoryId)}
              className={cn(
                "rounded-2xl px-5 py-3 text-sm font-black ring-1 transition",
                activeCategoryId === categoryId
                  ? "bg-blue-700 text-white ring-blue-700 shadow-lg shadow-blue-700/20"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileCartButton({ itemCount, total, onClick }) {
  return (
    <div className="fixed bottom-0 left-1/2 z-[80] w-full max-w-[480px] -translate-x-1/2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onClick}
        disabled={itemCount === 0}
        className="pointer-events-auto flex w-full items-center gap-4 rounded-[1.75rem] bg-slate-950 px-5 py-4 text-left text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        <div className="relative grid h-14 w-14 place-items-center">
          <ShoppingCart size={34} />
          <span className="absolute -right-1 -top-1 grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-sm font-black text-blue-700">
            {itemCount}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-black">
            {itemCount > 0 ? "Lihat Keranjang" : "Keranjang Kosong"}
          </p>
          <p className="text-sm font-semibold text-blue-100">
            {itemCount} item • {formatCurrency(total)}
          </p>
        </div>

        <ChevronRight size={30} />
      </button>
    </div>
  );
}

export function CustomerOrderPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const savedTracking = useMemo(
    () => getSavedCustomerTrackingSession(token),
    [token],
  );

  const [screen, setScreen] = useState(savedTracking ? "tracking" : "welcome");
  const [cartItems, setCartItems] = useState({});
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [trackingSession, setTrackingSession] = useState(savedTracking);

  const sessionQuery = useCustomerOrderSession(token);
  const menuQuery = useCustomerPublicMenu(token, Boolean(sessionQuery.data));
  const submitMutation = useSubmitCustomerOrder();

  const trackingQuery = useCustomerOrderTracking({
    orderId: trackingSession?.orderId,
    orderSessionToken: trackingSession?.orderSessionToken,
    enabled: screen === "tracking",
  });

  const categories = useMemo(
    () => menuQuery.data?.categories ?? [],
    [menuQuery.data],
  );

  const table =
    trackingQuery.data?.table ??
    sessionQuery.data?.table ??
    menuQuery.data?.table ??
    null;

  const itemCount = getCartItemCount(cartItems);
  const cartTotal = getCartTotal(cartItems);

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return categories
      .map((category) => {
        const categoryId = category.id ?? category.name;
        const menuItems = category.menuItems ?? [];

        if (activeCategoryId !== "all" && categoryId !== activeCategoryId) {
          return { ...category, menuItems: [] };
        }

        const filteredItems = keyword
          ? menuItems.filter((item) => {
              const searchableText = `${item.name ?? ""} ${
                item.description ?? ""
              }`.toLowerCase();

              return searchableText.includes(keyword);
            })
          : menuItems;

        return { ...category, menuItems: filteredItems };
      })
      .filter((category) => (category.menuItems ?? []).length > 0);
  }, [activeCategoryId, categories, searchTerm]);

  const handleIncrease = (menuItem) => {
    setCartItems((currentCartItems) => addCartItem(currentCartItems, menuItem));
  };

  const handleDecrease = (menuItemId) => {
    setCartItems((currentCartItems) =>
      decreaseCartItem(currentCartItems, menuItemId),
    );
  };

  const handleRemove = (menuItemId) => {
    setCartItems((currentCartItems) =>
      removeCartItem(currentCartItems, menuItemId),
    );
  };

  const handleNoteChange = (menuItemId, note) => {
    setCartItems((currentCartItems) =>
      updateCartItemNote(currentCartItems, menuItemId, note),
    );
  };

  const handleSubmit = async () => {
    if (!sessionQuery.data || itemCount === 0 || !customerName.trim()) {
      return;
    }

    const payload = buildSubmitOrderPayload({
      orderSessionId: sessionQuery.data.orderSessionId,
      orderSessionToken: sessionQuery.data.orderSessionToken,
      customerName,
      customerNote,
      cartItems,
    });

    const order = await submitMutation.mutateAsync(payload);

    const nextTrackingSession = {
      orderId: order.id,
      orderSessionToken: sessionQuery.data.orderSessionToken,
      orderNumber: order.orderNumber,
    };

    saveCustomerTrackingSession(token, nextTrackingSession);
    setTrackingSession(nextTrackingSession);
    setCartItems({});
    setCustomerNote("");
    setIsCartOpen(false);
    setScreen("tracking");
  };

  const handleNewOrder = async () => {
    clearCustomerTrackingSession(token);
    setTrackingSession(null);
    setCartItems({});
    setCustomerNote("");
    setScreen("welcome");
    submitMutation.reset();
    await sessionQuery.refetch();
  };

  if (!token) {
    return (
      <CustomerStateCard
        tone="red"
        title="QR tidak valid"
        description="Link pesanan tidak memiliki token QR. Silakan scan ulang QR dari meja."
      />
    );
  }

  if (sessionQuery.isLoading && screen !== "tracking") {
    return (
      <CustomerStateCard
        title="Memvalidasi QR"
        description="Tunggu sebentar, kami sedang memastikan QR meja masih aktif."
      />
    );
  }

  if (sessionQuery.isError && screen !== "tracking") {
    return (
      <CustomerStateCard
        tone="red"
        title="QR tidak bisa digunakan"
        description={
          sessionQuery.error?.message ||
          "QR sudah tidak aktif, kedaluwarsa, atau meja sedang tidak tersedia."
        }
        action={
          <button
            type="button"
            onClick={() => sessionQuery.refetch()}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Coba Lagi
          </button>
        }
      />
    );
  }

  if (screen === "tracking") {
    return (
      <CustomerPublicShell table={table}>
        <CustomerOrderTracker
          order={trackingQuery.data}
          isLoading={trackingQuery.isLoading || trackingQuery.isFetching}
          isError={trackingQuery.isError}
          errorMessage={trackingQuery.error?.message}
          onRefresh={() => trackingQuery.refetch()}
          onNewOrder={handleNewOrder}
        />
      </CustomerPublicShell>
    );
  }

  if (screen === "welcome") {
    return (
      <WelcomeStep
        table={table}
        isMenuLoading={menuQuery.isLoading}
        onStart={() => setScreen("identity")}
      />
    );
  }

  if (screen === "identity") {
    return (
      <IdentityStep
        table={table}
        customerName={customerName}
        onChangeName={setCustomerName}
        onNext={() => setScreen("menu")}
      />
    );
  }

  return (
    <CustomerPublicShell
      table={table}
      footer={
        <>
          <MobileCartButton
            itemCount={itemCount}
            total={cartTotal}
            onClick={() => setIsCartOpen(true)}
          />

          {isCartOpen ? (
            <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 backdrop-blur-sm">
              <div className="w-full max-w-[480px]">
              <CustomerCartPanel
                cartItems={cartItems}
                customerName={customerName}
                customerNote={customerNote}
                onCustomerNameChange={setCustomerName}
                onCustomerNoteChange={setCustomerNote}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                onNoteChange={handleNoteChange}
                onSubmit={handleSubmit}
                onClose={() => setIsCartOpen(false)}
                isSubmitting={submitMutation.isPending}
                errorMessage={submitMutation.error?.message}
              />
            </div>
            </div>
          ) : null}
        </>
      }
    >
      <div className="grid gap-5 px-5 py-6 pb-40">
        <section className="min-w-0 space-y-6">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-100/70" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-blue-700 ring-1 ring-blue-100">
                  <ChefHat size={15} />
                  Menu Digital
                </p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  Mau makan apa, {customerName.split(" ")[0] || "Kak"}?
                </h1>
                <p className="mt-2 text-base leading-7 text-slate-500">
                  Pilih menu favorit untuk {getTableLabel(table)}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-64">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    <Star size={14} />
                    Item
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {itemCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                    <Clock3 size={14} />
                    Total
                  </p>
                  <p className="mt-1 text-xl font-black text-blue-700">
                    {formatCurrency(cartTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={22}
            />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari menu favorit..."
              className="w-full rounded-[1.5rem] border border-slate-200 bg-white py-4 pl-13 pr-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <CategoryChips
            categories={categories}
            activeCategoryId={activeCategoryId}
            onChange={setActiveCategoryId}
          />

          {menuQuery.isLoading ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <Loader2 className="mx-auto animate-spin text-blue-700" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Memuat menu...
              </p>
            </div>
          ) : null}

          {menuQuery.isError ? (
            <div className="rounded-[2rem] bg-red-50 p-5 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {menuQuery.error?.message || "Menu gagal dimuat."}
            </div>
          ) : null}

          {!menuQuery.isLoading && filteredCategories.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-black text-slate-700">
                Menu tidak ditemukan.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Coba kata kunci atau kategori lain.
              </p>
            </div>
          ) : null}

          {filteredCategories.map((category) => (
            <section key={category.id ?? category.name} className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    {category.name}
                  </h2>
                  {category.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {category.description}
                    </p>
                  ) : null}
                </div>

                <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200 sm:inline-flex">
                  {(category.menuItems ?? []).length} menu
                </span>
              </div>

              <div className="grid gap-4">
                {(category.menuItems ?? []).map((item) => (
                  <CustomerMenuCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(cartItems, item.id)}
                    onIncrease={() => handleIncrease(item)}
                    onDecrease={() => handleDecrease(item.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </section>

        <div className="hidden">
          <div className="sticky top-28">
            <CustomerCartPanel
              cartItems={cartItems}
              customerName={customerName}
              customerNote={customerNote}
              onCustomerNameChange={setCustomerName}
              onCustomerNoteChange={setCustomerNote}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onRemove={handleRemove}
              onNoteChange={handleNoteChange}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
              errorMessage={submitMutation.error?.message}
            />
          </div>
        </div>
      </div>
    </CustomerPublicShell>
  );
}
