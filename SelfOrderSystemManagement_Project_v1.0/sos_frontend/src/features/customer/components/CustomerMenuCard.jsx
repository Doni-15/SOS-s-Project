import { BadgeCheck, Minus, Plus } from "lucide-react";

import { cn } from "../../../shared/utils/cn";
import {
  formatCurrency,
  getMenuItemImageUrl,
} from "../utils/customerOrderHelpers";

function isMenuOutOfStock(item) {
  return (
    item?.availabilityStatus === "OUT_OF_STOCK" ||
    item?.availabilityStatus === "HABIS" ||
    item?.isAvailable === false
  );
}

export function CustomerMenuCard({
  item,
  quantity = 0,
  onIncrease = () => {},
  onDecrease = () => {},
}) {
  const imageUrl = getMenuItemImageUrl(item?.imageUrl);
  const isOutOfStock = isMenuOutOfStock(item);

  return (
    <article
      className={cn(
        "rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/8",
        isOutOfStock && "opacity-70",
      )}
    >
      <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4">
        <div className="h-26 w-26 overflow-hidden rounded-[1.25rem] bg-slate-100 ring-1 ring-slate-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item?.name ?? "Menu"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-4xl">
              🍽️
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-black leading-snug text-slate-950">
              {item?.name}
            </h3>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ring-1",
                isOutOfStock
                  ? "bg-red-50 text-red-700 ring-red-100"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-100",
              )}
            >
              <BadgeCheck size={12} />
              {isOutOfStock ? "Habis" : "Tersedia"}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
            {item?.description || "Menu pilihan Resto Nusantara."}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-lg font-black text-blue-700">
              {formatCurrency(item?.price)}
            </p>

            {quantity > 0 ? (
              <div className="flex items-center rounded-2xl border border-blue-200 bg-white">
                <button
                  type="button"
                  onClick={onDecrease}
                  className="grid h-9 w-9 place-items-center text-blue-700"
                  aria-label={`Kurangi ${item?.name}`}
                >
                  <Minus size={17} />
                </button>

                <span className="w-8 text-center text-sm font-black text-slate-950">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={onIncrease}
                  disabled={isOutOfStock}
                  className="grid h-9 w-9 place-items-center text-blue-700 disabled:text-slate-400"
                  aria-label={`Tambah ${item?.name}`}
                >
                  <Plus size={17} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onIncrease}
                disabled={isOutOfStock}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-black transition",
                  isOutOfStock
                    ? "bg-slate-100 text-slate-400"
                    : "bg-blue-700 text-white shadow-lg shadow-blue-700/15 hover:bg-blue-800",
                )}
              >
                <Plus size={17} />
                Tambah
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
