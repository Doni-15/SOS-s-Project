export const USER_SUMMARY_SELECT = {
  id: true,
  username: true,
  fullName: true,
  role: true,
};

export const TABLE_SUMMARY_SELECT = {
  id: true,
  tableNumber: true,
  label: true,
  isActive: true,
};

export const ORDER_ITEMS_INCLUDE = {
  orderBy: {
    createdAt: "asc",
  },
};

export const ORDER_STATUS_HISTORIES_INCLUDE = {
  orderBy: {
    createdAt: "asc",
  },
  include: {
    changedByUser: {
      select: USER_SUMMARY_SELECT,
    },
  },
};

export const ORDER_TRANSACTION_SUMMARY_INCLUDE = {
  include: {
    cashier: {
      select: USER_SUMMARY_SELECT,
    },
    receipt: true,
  },
};

export const ORDER_RESPONSE_INCLUDE = {
  table: {
    select: TABLE_SUMMARY_SELECT,
  },
  orderItems: ORDER_ITEMS_INCLUDE,
  acceptedBy: {
    select: USER_SUMMARY_SELECT,
  },
  transaction: ORDER_TRANSACTION_SUMMARY_INCLUDE,
  statusHistories: ORDER_STATUS_HISTORIES_INCLUDE,
};

export const ORDER_LIST_INCLUDE = ORDER_RESPONSE_INCLUDE;

export const ORDER_FOR_PAYMENT_INCLUDE = {
  table: {
    select: TABLE_SUMMARY_SELECT,
  },
  orderItems: ORDER_ITEMS_INCLUDE,
  acceptedBy: {
    select: USER_SUMMARY_SELECT,
  },
  transaction: true,
};

const TRANSACTION_ORDER_INCLUDE = {
  table: {
    select: TABLE_SUMMARY_SELECT,
  },
  orderItems: ORDER_ITEMS_INCLUDE,
  acceptedBy: {
    select: USER_SUMMARY_SELECT,
  },
};

export const TRANSACTION_RESPONSE_INCLUDE = {
  order: {
    include: TRANSACTION_ORDER_INCLUDE,
  },
  cashier: {
    select: USER_SUMMARY_SELECT,
  },
  receipt: true,
};

export const RECEIPT_RESPONSE_INCLUDE = {
  transaction: {
    include: {
      order: {
        include: TRANSACTION_ORDER_INCLUDE,
      },
      cashier: {
        select: USER_SUMMARY_SELECT,
      },
    },
  },
  printAttempts: {
    orderBy: {
      attemptedAt: "desc",
    },
    include: {
      cashier: {
        select: USER_SUMMARY_SELECT,
      },
    },
  },
};
