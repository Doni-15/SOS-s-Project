const getRequiredEnv = (key) => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

export const appConfig = {
  apiBaseUrl: getRequiredEnv("VITE_API_BASE_URL"),
  publicOrderBaseUrl:
    import.meta.env.VITE_PUBLIC_ORDER_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : ""),
  authTokenKey: "sos_access_token",
  authUserKey: "sos_auth_user",
  authExpiresAtKey: "sos_auth_expires_at",
  authRememberKey: "sos_auth_remember",
};

export const USER_ROLES = {
  OWNER: "OWNER",
  CASHIER: "CASHIER",
};

export const ROUTES = {
  login: "/login",
  unauthorized: "/unauthorized",
  publicOrder: "/order",

  ownerDashboard: "/owner/dashboard",
  ownerReports: "/owner/reports",
  ownerAnalytics: "/owner/analytics",
  ownerMenu: "/owner/menu",
  ownerTables: "/owner/tables",
  ownerUsers: "/owner/users",
  ownerUserCreate: "/owner/users/new",
  ownerUserEdit: "/owner/users/:userId/edit",
  ownerUserEditPath: (userId) => `/owner/users/${userId}/edit`,
  ownerSettings: "/owner/settings",

  cashierOrders: "/cashier/orders",
  cashierTransactions: "/cashier/transactions",
  cashierMenu: "/cashier/menu",
  cashierOrderDetail: "/cashier/orders/:orderId",
  cashierOrderPayment: "/cashier/orders/:orderId/payment",
  cashierTransactionSuccess: "/cashier/transactions/:transactionId/success",
  cashierTransactionReceipt: "/cashier/transactions/:transactionId/receipt",
  cashierOrderDetailPath: (orderId) => `/cashier/orders/${orderId}`,
  cashierOrderPaymentPath: (orderId) => `/cashier/orders/${orderId}/payment`,
  cashierTransactionSuccessPath: (transactionId) =>
    `/cashier/transactions/${transactionId}/success`,
  cashierTransactionReceiptPath: (transactionId) =>
    `/cashier/transactions/${transactionId}/receipt`,
};

export const ROLE_HOME_PATH = {
  [USER_ROLES.OWNER]: ROUTES.ownerDashboard,
  [USER_ROLES.CASHIER]: ROUTES.cashierOrders,
};

export const API_ENDPOINTS = {
  health: "/health",
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  reports: {
    salesSummary: "/internal/reports/sales-summary",
    dailySales: "/internal/reports/daily-sales",
    topMenuItems: "/internal/reports/top-menu-items",
  },
  menu: {
    categories: "/internal/menu-categories",
    categoryDetail: (id) => `/internal/menu-categories/${id}`,
    items: "/internal/menu-items",
    itemDetail: (id) => `/internal/menu-items/${id}`,
  },
  users: {
    list: "/internal/users",
    detail: (id) => `/internal/users/${id}`,
    password: (id) => `/internal/users/${id}/password`,
  },
  tables: {
    list: "/internal/tables",
    detail: (id) => `/internal/tables/${id}`,
    activate: (id) => `/internal/tables/${id}/activate`,
    deactivate: (id) => `/internal/tables/${id}/deactivate`,
    qrTokens: (tableId) => `/internal/tables/${tableId}/qr-tokens`,
    revokeQrToken: (qrTokenId) => `/internal/qr-tokens/${qrTokenId}/revoke`,
  },
  uploads: {
    menuImage: "/internal/uploads/menu-image",
  },
};

export const QUERY_KEYS = {
  system: {
    health: ["system", "health"],
  },
  auth: {
    all: ["auth"],
    me: ["auth", "me"],
  },
  reports: {
    all: ["reports"],
    salesSummary: (params) => ["reports", "sales-summary", params],
    dailySales: (params) => ["reports", "daily-sales", params],
    topMenuItems: (params) => ["reports", "top-menu-items", params],
  },
  menu: {
    all: ["menu"],
    categories: () => ["menu", "categories"],
    items: (params) => ["menu", "items", params],
  },
  users: {
    all: ["users"],
    list: (params) => ["users", "list", params],
    detail: (id) => ["users", "detail", id],
  },
  tables: {
    all: ["tables"],
    list: (params) => ["tables", "list", params],
    detail: (id) => ["tables", "detail", id],
    qrTokens: (tableId, params) => ["tables", "qr-tokens", tableId, params],
  },
};
