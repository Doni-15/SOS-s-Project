import { prisma } from "../../config/prisma.js";

export const findUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const updateLastLogin = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  });
};

export const createUserSession = async ({
  id,
  userId,
  tokenHash,
  ipAddress,
  userAgent,
  expiresAt,
}) => {
  return prisma.userSession.create({
    data: {
      id,
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });
};

export const findActiveSessionByTokenHash = async (tokenHash) => {
  return prisma.userSession.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
};

export const revokeSessionByTokenHash = async (tokenHash) => {
  return prisma.userSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};
