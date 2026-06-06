import { successResponse } from "../../common/responses/apiResponse.js";
import {
  createTableSchema,
  generateQrTokenSchema,
  qrTokenParamSchema,
  qrTokenQuerySchema,
  tableParamSchema,
  tableQuerySchema,
  updateTableSchema,
} from "./table.validation.js";
import {
  activateTable,
  createTable,
  deactivateTable,
  generateTableQrToken,
  getTableById,
  getTableQrTokens,
  getTables,
  revokeQrToken,
  updateTable,
} from "./table.service.js";

export const getTablesController = async (req, res, next) => {
  try {
    const query = tableQuerySchema.parse(req.query);
    const tables = await getTables(query);

    return successResponse(res, {
      message: "Tables retrieved successfully",
      data: {
        tables,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTableDetailController = async (req, res, next) => {
  try {
    const params = tableParamSchema.parse(req.params);
    const table = await getTableById(params.id);

    return successResponse(res, {
      message: "Table retrieved successfully",
      data: {
        table,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTableController = async (req, res, next) => {
  try {
    const payload = createTableSchema.parse(req.body);

    const table = await createTable({
      payload,
      actor: req.user,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Table created successfully",
      data: {
        table,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTableController = async (req, res, next) => {
  try {
    const params = tableParamSchema.parse(req.params);
    const payload = updateTableSchema.parse(req.body);

    const table = await updateTable({
      id: params.id,
      payload,
      actor: req.user,
    });

    return successResponse(res, {
      message: "Table updated successfully",
      data: {
        table,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const activateTableController = async (req, res, next) => {
  try {
    const params = tableParamSchema.parse(req.params);

    const table = await activateTable({
      id: params.id,
      actor: req.user,
    });

    return successResponse(res, {
      message: "Table activated successfully",
      data: {
        table,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateTableController = async (req, res, next) => {
  try {
    const params = tableParamSchema.parse(req.params);

    const table = await deactivateTable({
      id: params.id,
      actor: req.user,
    });

    return successResponse(res, {
      message: "Table deactivated successfully",
      data: {
        table,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTableQrTokensController = async (req, res, next) => {
  try {
    const params = tableParamSchema.parse(req.params);
    const query = qrTokenQuerySchema.parse(req.query);

    const qrTokens = await getTableQrTokens({
      tableId: params.id,
      query,
    });

    return successResponse(res, {
      message: "Table QR tokens retrieved successfully",
      data: {
        qrTokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateTableQrTokenController = async (req, res, next) => {
  try {
    const params = tableParamSchema.parse(req.params);
    const payload = generateQrTokenSchema.parse(req.body);

    const qrToken = await generateTableQrToken({
      tableId: params.id,
      payload,
      actor: req.user,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "QR token generated successfully",
      data: {
        qrToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const revokeQrTokenController = async (req, res, next) => {
  try {
    const params = qrTokenParamSchema.parse(req.params);

    const qrToken = await revokeQrToken({
      id: params.id,
      actor: req.user,
    });

    return successResponse(res, {
      message: "QR token revoked successfully",
      data: {
        qrToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
