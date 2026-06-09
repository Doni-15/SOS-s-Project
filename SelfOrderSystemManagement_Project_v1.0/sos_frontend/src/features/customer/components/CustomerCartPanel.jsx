import {
  MessageSquare,
  Minus,
  Plus,
  ReceiptText,
  Send,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  formatCurrency,
  getCartItemCount,
  getCartList,
  getCartTotal,
  getMenuItemImageUrl,
} from "../utils/customerOrderHelpers";

function CartItemImage({ item }) {
  const imageUrl = getMenuItemImageUrl(item.imageUrl);

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-2xl">🍽️</div>
      )}
    </div>
  );
}

export function CustomerCartPanel({
  cartItems = {},
  customerName = "",
  customerNote = "",
  onCustomerNameChange = () => {},
  onCustomerNoteChange = () => {},
  onIncrease = () => {},
  onDecrease = () => {},
  onRemove = () => {},
  onNoteChange = () => {},
  onSubmit = () => {},
  onClose,
  isSubmitting = false,
  errorMessage = "",
}) {
  const cartList = getCartList(cartItems);
  const itemCount = getCartItemCount(cartItems);
  const total = getCartTotal(cartItems);
  const isEmpty = itemCount === 0;
  const canSubmit = !isEmpty && customerName.trim().length > 0 && !isSubmitting;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <aside className="flex max-h-[92vh] flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl ring-1 ring-slate-200 lg:max-h-[calc(100vh-8rem)] lg:rounded-[2rem]">
      <div className="relative overflow-hidden bg-white p-5">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/80" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Keranjang
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Pesanan Kamu
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {itemCount} item siap dikirim ke kasir
            </p>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
              aria-label="Tutup keranjang"
            >
              <X size={22} />
            </button>
          ) : (
            <div className="grid h-13 w-13 place-items-center rounded-3xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
              <ShoppingCart size={24} />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {isEmpty ? (
            <div className="rounded-[1.75rem] bg-slate-50 p-7 text-center ring-1 ring-slate-100">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-100">
                <ShoppingCart size={28} />
              </div>
              <p className="mt-4 text-base font-black text-slate-900">
                Belum ada menu dipilih
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Tambahkan makanan atau minuman favoritmu, lalu kirim pesanan
                langsung ke kasir.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartList.map((item) => (
                <div
                  key={item.menuItemId}
                  className="rounded-[1.75rem] bg-white p-3 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex gap-3">
                    <CartItemImage item={item} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-slate-950">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {formatCurrency(item.price)} / item
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemove(item.menuItemId)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
                          aria-label={`Hapus ${item.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-2xl bg-blue-50 p-1 ring-1 ring-blue-100">
                          <button
                            type="button"
                            onClick={() => onDecrease(item.menuItemId)}
                            className="grid h-8 w-8 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="w-9 text-center text-sm font-black text-slate-950">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => onIncrease(item)}
                            className="grid h-8 w-8 place-items-center rounded-xl bg-blue-700 text-white shadow-sm"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <p className="text-sm font-black text-blue-700">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={item.note ?? ""}
                    onChange={(event) =>
                      onNoteChange(item.menuItemId, event.target.value)
                    }
                    maxLength={120}
                    rows={2}
                    placeholder="Catatan item, contoh: tidak pedas"
                    className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 rounded-[1.75rem] bg-slate-50 p-4 ring-1 ring-slate-100">
            <label className="block">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <UserRound size={14} />
                Nama Pemesan
              </span>
              <input
                value={customerName}
                onChange={(event) => onCustomerNameChange(event.target.value)}
                maxLength={100}
                placeholder="Contoh: Andi"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <MessageSquare size={14} />
                Catatan Restoran
              </span>
              <textarea
                value={customerNote}
                onChange={(event) => onCustomerNoteChange(event.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Contoh: tolong alat makan lebih"
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-100 bg-white p-5">
          <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Total item</span>
              <span className="font-black text-slate-950">{itemCount} item</span>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <span className="text-base font-black text-slate-950">Total</span>
              <span className="text-2xl font-black text-blue-700">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-slate-950 px-5 py-4 text-base font-black text-white shadow-xl shadow-slate-900/15 transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            {isSubmitting ? (
              "Mengirim..."
            ) : (
              <>
                <Send size={20} />
                Kirim Pesanan
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
            <ReceiptText size={14} />
            Pesanan akan masuk ke dashboard kasir secara real-time.
          </p>
        </div>
      </form>
    </aside>
  );
}
