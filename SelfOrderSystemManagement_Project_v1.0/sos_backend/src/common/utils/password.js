import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, env.passwordSaltRounds);
};

export const comparePassword = async (plainPassword, passwordHash) => {
  return bcrypt.compare(plainPassword, passwordHash);
};
