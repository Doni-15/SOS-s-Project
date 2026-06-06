import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../errors/AppError.js";
import { hashToken } from "../utils/hashToken.js";
import { findActiveSessionByTokenHash } from "../../modules/auth/auth.repository.js";

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication token is required",
      });
    }

    const accessToken = authorization.split(" ")[1];

    try {
      jwt.verify(accessToken, env.jwtSecret);
    } catch (error) {
      throw new AppError({
        statusCode: 401,
        code: "INVALID_TOKEN",
        message: "Invalid or expired authentication token",
      });
    }

    const tokenHash = hashToken(accessToken);
    const session = await findActiveSessionByTokenHash(tokenHash);

    if (!session || !session.user || !session.user.isActive) {
      throw new AppError({
        statusCode: 401,
        code: "SESSION_EXPIRED",
        message: "Session is expired or revoked",
      });
    }

    req.accessToken = accessToken;
    req.user = {
      id: session.user.id,
      sessionId: session.id,
      username: session.user.username,
      fullName: session.user.fullName,
      phone: session.user.phone,
      role: session.user.role,
      isActive: session.user.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError({
          statusCode: 401,
          code: "UNAUTHORIZED",
          message: "Authentication is required",
        })
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError({
          statusCode: 403,
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        })
      );
    }

    next();
  };
};
