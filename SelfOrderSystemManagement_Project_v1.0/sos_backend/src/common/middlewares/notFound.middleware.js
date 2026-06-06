import { AppError } from "../errors/AppError.js";

export const notFoundMiddleware = (req, res, next) => {
  next(
    new AppError({
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    })
  );
};
