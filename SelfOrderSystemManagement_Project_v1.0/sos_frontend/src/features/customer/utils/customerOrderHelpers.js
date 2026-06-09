import { appConfig } from "../../../shared/constants/appConfig";

const imageBaseUrl = appConfig.apiBaseUrl.replace(/\/api\/?$/, "");

export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getMenuItemImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${imageBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export function getTableLabel(table) {
  if (!table) return "Meja";

  const tableNumber = table.tableNumber ?? table.table_number;
  const label = table.label;

  if (tableNumber) return `Meja ${tableNumber}`;
  if (label) return label;

  return "Meja";
}

export function getCartList(cartItems = {}) {
  return Object.values(cartItems);
}

export function getCartItemCount(cartItems = {}) {
  return getCartList(cartItems).reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(cartItems = {}) {
  return getCartList(cartItems).reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0,
  );
}

export function getItemQuantity(cartItems = {}, menuItemId) {
  return cartItems[menuItemId]?.quantity ?? 0;
}

export function isMenuItemOutOfStock(item) {
  return (
    item?.availabilityStatus === "OUT_OF_STOCK" ||
    item?.availability_status === "OUT_OF_STOCK"
  );
}

export function addCartItem(cartItems, menuItem) {
  const currentItem = cartItems[menuItem.id];

  return {
    ...cartItems,
    [menuItem.id]: {
      id: menuItem.id,
      menuItemId: menuItem.menuItemId ?? menuItem.id,
      name: menuItem.name,
      description: menuItem.description ?? "",
      price: Number(menuItem.price || 0),
      imageUrl: menuItem.imageUrl ?? menuItem.image_url ?? "",
      categoryName:
        menuItem.categoryName ??
        menuItem.category?.name ??
        menuItem.category_name ??
        "",
      quantity: (currentItem?.quantity ?? 0) + 1,
      note: currentItem?.note ?? "",
    },
  };
}

export function decreaseCartItem(cartItems, menuItemId) {
  const currentItem = cartItems[menuItemId];

  if (!currentItem) return cartItems;

  if (currentItem.quantity <= 1) {
    const nextCartItems = { ...cartItems };
    delete nextCartItems[menuItemId];
    return nextCartItems;
  }

  return {
    ...cartItems,
    [menuItemId]: {
      ...currentItem,
      quantity: currentItem.quantity - 1,
    },
  };
}

export function removeCartItem(cartItems, menuItemId) {
  const nextCartItems = { ...cartItems };
  delete nextCartItems[menuItemId];
  return nextCartItems;
}

export function updateCartItemNote(cartItems, menuItemId, note) {
  const currentItem = cartItems[menuItemId];

  if (!currentItem) return cartItems;

  return {
    ...cartItems,
    [menuItemId]: {
      ...currentItem,
      note,
    },
  };
}

export function buildSubmitOrderPayload({
  orderSessionId,
  orderSessionToken,
  customerName,
  customerNote,
  cartItems,
}) {
  return {
    orderSessionId,
    orderSessionToken,
    customerName: customerName.trim(),
    customerNote: customerNote.trim() || null,
    items: getCartList(cartItems).map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      note: item.note?.trim() || null,
    })),
  };
}

export function getCustomerTrackingStorageKey(token) {
  return `sos_customer_tracking_${token}`;
}

export function saveCustomerTrackingSession(token, data) {
  if (!token || !data?.orderId || !data?.orderSessionToken) return;

  sessionStorage.setItem(getCustomerTrackingStorageKey(token), JSON.stringify(data));
}

export function getSavedCustomerTrackingSession(token) {
  if (!token) return null;

  try {
    const rawValue = sessionStorage.getItem(getCustomerTrackingStorageKey(token));
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export function clearCustomerTrackingSession(token) {
  if (!token) return;
  sessionStorage.removeItem(getCustomerTrackingStorageKey(token));
}

export const CUSTOMER_STATUS_META = {
  SUBMITTED: {
    label: "Menunggu Konfirmasi",
    description: "Pesanan kamu sudah masuk dan menunggu kasir menerima pesanan.",
    step: 1,
  },
  ACCEPTED: {
    label: "Sedang Diproses",
    description: "Kasir sudah menerima pesanan. Dapur sedang menyiapkan pesananmu.",
    step: 2,
  },
  SERVED: {
    label: "Sudah Dihidangkan",
    description: "Pesanan sudah dihidangkan. Silakan lakukan pembayaran ke kasir.",
    step: 3,
  },
  PAID: {
    label: "Sudah Dibayar",
    description: "Pembayaran selesai. Struk digital sudah tersedia.",
    step: 4,
  },
  CANCELLED: {
    label: "Dibatalkan",
    description: "Pesanan dibatalkan. Silakan hubungi kasir.",
    step: 0,
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    description: "Sesi pesanan sudah kedaluwarsa. Silakan scan ulang QR.",
    step: 0,
  },
};

export function getStatusMeta(status) {
  return CUSTOMER_STATUS_META[status] ?? CUSTOMER_STATUS_META.SUBMITTED;
}
