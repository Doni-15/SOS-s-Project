export const ORDER_ENDPOINTS = {
  list: "/internal/orders",
  detail: (id) => `/internal/orders/${id}`,
  accept: (id) => `/internal/orders/${id}/accept`,
  served: (id) => `/internal/orders/${id}/served`,
  cancel: (id) => `/internal/orders/${id}/cancel`,
};

export const ORDER_QUERY_KEYS = {
  all: ["orders"],
  lists: () => [...ORDER_QUERY_KEYS.all, "list"],
  list: (filters) => [...ORDER_QUERY_KEYS.lists(), filters],
  details: () => [...ORDER_QUERY_KEYS.all, "detail"],
  detail: (id) => [...ORDER_QUERY_KEYS.details(), id],
};

export const ORDER_STATUSES = [
  "SUBMITTED",
  "ACCEPTED",
  "SERVED",
  "PAID",
  "CANCELLED",
  "EXPIRED",
];

export const ORDER_STATUS_LABELS = {
  SUBMITTED: "Masuk",
  ACCEPTED: "Diterima",
  SERVED: "Dihidangkan",
  PAID: "Lunas",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Expired",
};
