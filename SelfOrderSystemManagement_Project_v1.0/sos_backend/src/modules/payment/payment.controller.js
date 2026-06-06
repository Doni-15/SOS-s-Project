import { successResponse } from "../../common/responses/apiResponse.js";
import {
  createPaymentSchema,
  orderPaymentParamSchema,
  printReceiptFailedSchema,
  receiptParamSchema,
  transactionParamSchema,
  transactionQuerySchema,
} from "./payment.validation.js";
import {
  getReceiptDetail,
  getTransactionDetail,
  getTransactions,
  markReceiptPrintFailed,
  markReceiptPrintSuccess,
  processCashPayment,
} from "./payment.service.js";

export const createPaymentController = async (req, res, next) => {
  try {
    const params = orderPaymentParamSchema.parse(req.params);
    const payload = createPaymentSchema.parse(req.body);

    const result = await processCashPayment({
      orderId: params.id,
      payload,
      user: req.user,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Payment completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionsController = async (req, res, next) => {
  try {
    const query = transactionQuerySchema.parse(req.query);
    const transactions = await getTransactions(query);

    return successResponse(res, {
      message: "Transactions retrieved successfully",
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionDetailController = async (req, res, next) => {
  try {
    const params = transactionParamSchema.parse(req.params);
    const transaction = await getTransactionDetail(params.id);

    return successResponse(res, {
      message: "Transaction retrieved successfully",
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReceiptDetailController = async (req, res, next) => {
  try {
    const params = receiptParamSchema.parse(req.params);
    const receipt = await getReceiptDetail(params.id);

    return successResponse(res, {
      message: "Receipt retrieved successfully",
      data: {
        receipt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markReceiptPrintSuccessController = async (req, res, next) => {
  try {
    const params = receiptParamSchema.parse(req.params);

    const receipt = await markReceiptPrintSuccess({
      receiptId: params.id,
      user: req.user,
    });

    return successResponse(res, {
      message: "Receipt print success recorded successfully",
      data: {
        receipt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markReceiptPrintFailedController = async (req, res, next) => {
  try {
    const params = receiptParamSchema.parse(req.params);
    const payload = printReceiptFailedSchema.parse(req.body);

    const receipt = await markReceiptPrintFailed({
      receiptId: params.id,
      errorMessage: payload.errorMessage,
      user: req.user,
    });

    return successResponse(res, {
      message: "Receipt print failure recorded successfully",
      data: {
        receipt,
      },
    });
  } catch (error) {
    next(error);
  }
};
