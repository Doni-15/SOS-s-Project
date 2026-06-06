import { runWithRequestContext } from "../utils/requestContext.js";

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

export const requestContextMiddleware = (req, res, next) => {
  const context = {
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
    requestId: req.headers["x-request-id"] ?? null,
    method: req.method,
    path: req.originalUrl,
  };

  runWithRequestContext(context, next);
};
