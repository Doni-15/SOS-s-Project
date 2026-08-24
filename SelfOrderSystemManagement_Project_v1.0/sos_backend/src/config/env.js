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

const nodeEnv = getRequiredEnv("NODE_ENV");

if (!new Set(["development", "test", "production"]).has(nodeEnv)) {
  throw new Error("NODE_ENV must be development, test, or production");
}

const isProduction = nodeEnv === "production";
const port = getNumberEnv("PORT", 5000);

const normalizePublicBaseUrl = (value) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("PUBLIC_BASE_URL must be a valid absolute URL");
  }

  if (!new Set(["http:", "https:"]).has(parsedUrl.protocol)) {
    throw new Error("PUBLIC_BASE_URL must use HTTP or HTTPS");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("PUBLIC_BASE_URL must not contain credentials");
  }

  if (
    parsedUrl.pathname !== "/" ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error("PUBLIC_BASE_URL must contain only an origin without path, query, or fragment");
  }

  if (isProduction && parsedUrl.protocol !== "https:") {
    throw new Error("PUBLIC_BASE_URL must use HTTPS in production");
  }

  return parsedUrl.origin;
};

const corsOrigin =
  process.env.CORS_ORIGIN?.trim() ||
  (isProduction ? "" : "http://localhost:5173");

if (isProduction && (!corsOrigin || corsOrigin === "*")) {
  throw new Error("CORS_ORIGIN must be set to explicit origin(s) in production");
}

const publicBaseUrl =
  process.env.PUBLIC_BASE_URL?.trim() ||
  (isProduction ? "" : `http://localhost:${port}`);

if (!publicBaseUrl) {
  throw new Error("PUBLIC_BASE_URL is required in production");
}

export const env = {
  nodeEnv,
  port,
  databaseUrl: getRequiredEnv("DATABASE_URL"),

  jwtSecret: getRequiredEnv("JWT_SECRET", { minLength: 32 }),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "10m",

  passwordSaltRounds: getNumberEnv("PASSWORD_SALT_ROUNDS", 10),
  tokenHashSecret: getRequiredEnv("TOKEN_HASH_SECRET", { minLength: 32 }),

  orderSessionExpiresMinutes: getNumberEnv("ORDER_SESSION_EXPIRES_MINUTES", 30),

  corsOrigin,
  publicBaseUrl: normalizePublicBaseUrl(publicBaseUrl),
};
