import { ZodError } from "zod";
import { errorResponse } from "../responses/apiResponse.js";

export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    const fields = {};
    const issues = err.issues || err.errors || [];

    issues.forEach((issue) => {
      const fieldName = issue.path.join(".");
      fields[fieldName] = issue.message;
    });

    return errorResponse(res, {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      fields,
      path: req.originalUrl,
    });
  }

  if (err.isOperational) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      fields: err.fields,
      path: req.originalUrl,
    });
  }

  return errorResponse(res, {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    path: req.originalUrl,
  });
};
