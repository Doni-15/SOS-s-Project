import { prisma } from "../../config/prisma.js";

const userSelect = {
  id: true,
  username: true,
  fullName: true,
  phone: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export const findUsers = async ({ search, role, isActive, limit }) => {
  return prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: userSelect,
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

export const findUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const createUserRecord = async (data) => {
  return prisma.user.create({
    data,
    select: userSelect,
  });
};

export const updateUserRecord = async ({ id, data }) => {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
};
