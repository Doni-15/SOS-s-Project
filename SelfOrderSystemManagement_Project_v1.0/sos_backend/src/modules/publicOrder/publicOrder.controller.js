import { successResponse } from "../../common/responses/apiResponse.js";
import {
  qrTokenQuerySchema,
  submitOrderSchema,
  validateQrTokenSchema,
} from "./publicOrder.validation.js";
import {
  getPublicMenu,
  submitCustomerOrder,
  validateQrToken,
} from "./publicOrder.service.js";

export const validateQrTokenController = async (req, res, next) => {
  try {
    const payload = validateQrTokenSchema.parse(req.body);

    const result = await validateQrToken({
      token: payload.token,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return successResponse(res, {
      message: "QR token validated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicMenuController = async (req, res, next) => {
  try {
    const query = qrTokenQuerySchema.parse(req.query);

    const result = await getPublicMenu({
      token: query.token,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return successResponse(res, {
      message: "Public menu retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const submitCustomerOrderController = async (req, res, next) => {
  try {
    const payload = submitOrderSchema.parse(req.body);

    const order = await submitCustomerOrder({
      payload,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Order submitted successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};
