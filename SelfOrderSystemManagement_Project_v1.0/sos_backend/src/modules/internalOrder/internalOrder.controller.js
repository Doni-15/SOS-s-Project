import { successResponse } from "../../common/responses/apiResponse.js";
import {
  cancelOrderSchema,
  orderParamSchema,
  orderQuerySchema,
} from "./internalOrder.validation.js";
import {
  acceptOrder,
  cancelOrder,
  getInternalOrderById,
  getInternalOrders,
} from "./internalOrder.service.js";

export const getInternalOrdersController = async (req, res, next) => {
  try {
    const query = orderQuerySchema.parse(req.query);
    const orders = await getInternalOrders(query);

    return successResponse(res, {
      message: "Orders retrieved successfully",
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalOrderDetailController = async (req, res, next) => {
  try {
    const params = orderParamSchema.parse(req.params);
    const order = await getInternalOrderById(params.id);

    return successResponse(res, {
      message: "Order retrieved successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const acceptOrderController = async (req, res, next) => {
  try {
    const params = orderParamSchema.parse(req.params);

    const order = await acceptOrder({
      id: params.id,
      user: req.user,
    });

    return successResponse(res, {
      message: "Order accepted successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrderController = async (req, res, next) => {
  try {
    const params = orderParamSchema.parse(req.params);
    const payload = cancelOrderSchema.parse(req.body);

    const order = await cancelOrder({
      id: params.id,
      payload,
      user: req.user,
    });

    return successResponse(res, {
      message: "Order cancelled successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};
