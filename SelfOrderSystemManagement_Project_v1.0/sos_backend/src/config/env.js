import dotenv from "dotenv";

dotenv.config();

const getRequiredEnv = (key, { minLength = 1 } = {}) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  if (value.length < minLength) {
    throw new Error(`${key} must be at least ${minLength} characters`);
  }

  return value;
};

const getNumberEnv = (key, fallback) => {
  const value = Number(process.env[key]);

  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return fallback;
};

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const corsOrigin =
  process.env.CORS_ORIGIN?.trim() ||
  (isProduction ? "" : "http://localhost:5173");

if (isProduction && (!corsOrigin || corsOrigin === "*")) {
  throw new Error("CORS_ORIGIN must be set to explicit origin(s) in production");
}

export const env = {
  nodeEnv,
  port: getNumberEnv("PORT", 5000),
  databaseUrl: getRequiredEnv("DATABASE_URL"),

  jwtSecret: getRequiredEnv("JWT_SECRET", { minLength: 32 }),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "10m",

  passwordSaltRounds: getNumberEnv("PASSWORD_SALT_ROUNDS", 10),
  tokenHashSecret: getRequiredEnv("TOKEN_HASH_SECRET", { minLength: 32 }),

  orderSessionExpiresMinutes: getNumberEnv("ORDER_SESSION_EXPIRES_MINUTES", 30),

  corsOrigin,
};
