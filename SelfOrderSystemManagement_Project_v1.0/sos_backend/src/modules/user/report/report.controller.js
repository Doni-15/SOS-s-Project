import { successResponse } from "../../common/responses/apiResponse.js";
import {
  reportQuerySchema,
  topMenuItemsQuerySchema,
} from "./report.validation.js";
import {
  getDailySales,
  getSalesSummary,
  getTopMenuItems,
} from "./report.service.js";

export const getSalesSummaryController = async (req, res, next) => {
  try {
    const query = reportQuerySchema.parse(req.query);
    const report = await getSalesSummary(query);

    return successResponse(res, {
      message: "Sales summary retrieved successfully",
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDailySalesController = async (req, res, next) => {
  try {
    const query = reportQuerySchema.parse(req.query);
    const report = await getDailySales(query);

    return successResponse(res, {
      message: "Daily sales report retrieved successfully",
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopMenuItemsController = async (req, res, next) => {
  try {
    const query = topMenuItemsQuerySchema.parse(req.query);
    const report = await getTopMenuItems(query);

    return successResponse(res, {
      message: "Top menu items report retrieved successfully",
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};
