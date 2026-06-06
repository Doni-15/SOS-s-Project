import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { hashPassword } from "../../common/utils/password.js";
import {
  createUserRecord,
  findUserById,
  findUserByUsername,
  findUsers,
  updateUserRecord,
} from "./user.repository.js";

const normalizeNullableString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmed = String(value).trim();
  return trimmed.length === 0 ? null : trimmed;
};

const toBooleanFilter = (value) => {
  if (value === undefined) return undefined;
  return value === "true";
};

const ensureUserExists = async (id) => {
  const user = await findUserById(id);

  if (!user) {
    throw new AppError({
      statusCode: 404,
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }

  return user;
};

const ensureUsernameAvailable = async ({ username, excludeUserId = null }) => {
  if (!username) return;

  const existingUser = await findUserByUsername(username);

  if (existingUser && existingUser.id !== excludeUserId) {
    throw new AppError({
      statusCode: 409,
      code: "USERNAME_EXISTS",
      message: "Username already exists",
      fields: {
        username,
      },
    });
  }
};

export const getUsers = async (query) => {
  return findUsers({
    search: query.search,
    role: query.role,
    isActive: toBooleanFilter(query.isActive),
    limit: query.limit,
  });
};

export const getUserById = async (id) => {
  return ensureUserExists(id);
};

export const createUser = async ({ payload, actor }) => {
  await ensureUsernameAvailable({ username: payload.username });

  const passwordHash = await hashPassword(payload.password);

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: payload.username,
        passwordHash,
        fullName: normalizeNullableString(payload.fullName),
        phone: normalizeNullableString(payload.phone),
        role: payload.role,
        isActive: payload.isActive,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "USER_CREATED",
        entityType: "user",
        entityId: user.id,
        metadata: {
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdBy: actor.username,
        },
      },
    });

    return user;
  });

  return createdUser;
};

export const updateUser = async ({ id, payload, actor }) => {
  const existingUser = await ensureUserExists(id);

  if (actor.id === id && payload.role && payload.role !== existingUser.role) {
    throw new AppError({
      statusCode: 409,
      code: "CANNOT_CHANGE_OWN_ROLE",
      message: "You cannot change your own role",
    });
  }

  if (actor.id === id && payload.isActive === false) {
    throw new AppError({
      statusCode: 409,
      code: "CANNOT_DEACTIVATE_SELF",
      message: "You cannot deactivate your own account",
    });
  }

  await ensureUsernameAvailable({
    username: payload.username,
    excludeUserId: id,
  });

  const data = {};

  if (payload.username !== undefined) data.username = payload.username;
  if (payload.fullName !== undefined) {
    data.fullName = normalizeNullableString(payload.fullName);
  }
  if (payload.phone !== undefined) {
    data.phone = normalizeNullableString(payload.phone);
  }
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.isActive !== undefined) data.isActive = payload.isActive;

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "USER_UPDATED",
        entityType: "user",
        entityId: id,
        metadata: {
          previous: {
            username: existingUser.username,
            fullName: existingUser.fullName,
            phone: existingUser.phone,
            role: existingUser.role,
            isActive: existingUser.isActive,
          },
          next: {
            username: user.username,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
          },
          updatedBy: actor.username,
        },
      },
    });

    return user;
  });

  return updatedUser;
};

export const resetUserPassword = async ({ id, payload, actor }) => {
  const existingUser = await ensureUserExists(id);
  const passwordHash = await hashPassword(payload.newPassword);

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: {
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.userSession.updateMany({
      where: {
        userId: id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "USER_PASSWORD_RESET",
        entityType: "user",
        entityId: id,
        metadata: {
          username: existingUser.username,
          resetBy: actor.username,
          revokedActiveSessions: true,
        },
      },
    });

    return user;
  });

  return updatedUser;
};

export const activateUser = async ({ id, actor }) => {
  await ensureUserExists(id);

  return updateUserRecordWithAudit({
    id,
    actor,
    action: "USER_ACTIVATED",
    data: {
      isActive: true,
    },
  });
};

export const deactivateUser = async ({ id, actor }) => {
  await ensureUserExists(id);

  if (actor.id === id) {
    throw new AppError({
      statusCode: 409,
      code: "CANNOT_DEACTIVATE_SELF",
      message: "You cannot deactivate your own account",
    });
  }

  return updateUserRecordWithAudit({
    id,
    actor,
    action: "USER_DEACTIVATED",
    data: {
      isActive: false,
    },
    revokeSessions: true,
  });
};

const updateUserRecordWithAudit = async ({
  id,
  actor,
  action,
  data,
  revokeSessions = false,
}) => {
  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (revokeSessions) {
      await tx.userSession.updateMany({
        where: {
          userId: id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action,
        entityType: "user",
        entityId: id,
        metadata: {
          username: user.username,
          isActive: user.isActive,
          performedBy: actor.username,
          revokedActiveSessions: revokeSessions,
        },
      },
    });

    return user;
  });

  return updatedUser;
};
