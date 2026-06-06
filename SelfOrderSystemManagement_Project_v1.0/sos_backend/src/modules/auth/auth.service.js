import crypto from "crypto";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { hashToken } from "../../common/utils/hashToken.js";
import { comparePassword } from "../../common/utils/password.js";
import {
  createUserSession,
  findUserByUsername,
  revokeSessionByTokenHash,
  updateLastLogin,
} from "./auth.repository.js";

const getJwtExpiresAt = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
};

const sanitizeUser = (user) => {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
  };
};

export const login = async ({ username, password, ipAddress, userAgent }) => {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid username or password",
    });
  }

  if (!user.isActive) {
    throw new AppError({
      statusCode: 403,
      code: "ACCOUNT_INACTIVE",
      message: "User account is inactive",
    });
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid username or password",
    });
  }

  const sessionId = crypto.randomUUID();
  const expiresAt = getJwtExpiresAt();

  const accessToken = jwt.sign(
    {
      sessionId,
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

  const tokenHash = hashToken(accessToken);

  await createUserSession({
    id: sessionId,
    userId: user.id,
    tokenHash,
    ipAddress,
    userAgent,
    expiresAt,
  });

  const updatedUser = await updateLastLogin(user.id);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGGED_IN",
      entityType: "user",
      entityId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        username: user.username,
        role: user.role,
      },
    },
  });

  return {
    accessToken,
    tokenType: "Bearer",
    expiresAt,
    user: sanitizeUser(updatedUser),
  };
};

export const logout = async ({ accessToken, user }) => {
  const tokenHash = hashToken(accessToken);

  await revokeSessionByTokenHash(tokenHash);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGGED_OUT",
      entityType: "user_session",
      entityId: user.sessionId,
      metadata: {
        username: user.username,
        role: user.role,
      },
    },
  });

  return true;
};
