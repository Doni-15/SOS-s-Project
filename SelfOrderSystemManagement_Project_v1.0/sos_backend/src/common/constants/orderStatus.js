import { AppError } from "../errors/AppError.js";

export const ORDER_STATUS = Object.freeze({
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  SERVED: "SERVED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

export const ORDER_STATUS_VALUES = Object.freeze(Object.values(ORDER_STATUS));

export const FINAL_ORDER_STATUSES = Object.freeze([
  ORDER_STATUS.PAID,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.EXPIRED,
]);

export const ORDER_STATUS_FLOW = Object.freeze({
  [ORDER_STATUS.SUBMITTED]: Object.freeze([
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.EXPIRED,
  ]),
  [ORDER_STATUS.ACCEPTED]: Object.freeze([
    ORDER_STATUS.SERVED,
    ORDER_STATUS.CANCELLED,
  ]),
  [ORDER_STATUS.SERVED]: Object.freeze([ORDER_STATUS.PAID]),
  [ORDER_STATUS.PAID]: Object.freeze([]),
  [ORDER_STATUS.CANCELLED]: Object.freeze([]),
  [ORDER_STATUS.EXPIRED]: Object.freeze([]),
});

export const getAllowedNextOrderStatuses = (status) => {
  return ORDER_STATUS_FLOW[status] ?? [];
};

export const isFinalOrderStatus = (status) => {
  return FINAL_ORDER_STATUSES.includes(status);
};

export const canTransitionOrderStatus = ({ from, to }) => {
  return getAllowedNextOrderStatuses(from).includes(to);
};

export const assertOrderTransitionAllowed = ({
  from,
  to,
  action = "change this order status",
}) => {
  if (canTransitionOrderStatus({ from, to })) {
    return true;
  }

  throw new AppError({
    statusCode: 409,
    code: "INVALID_ORDER_STATUS_TRANSITION",
    message: `Cannot ${action} from ${from} to ${to}`,
    fields: {
      currentStatus: from,
      targetStatus: to,
      allowedNextStatuses: getAllowedNextOrderStatuses(from),
    },
  });
};
