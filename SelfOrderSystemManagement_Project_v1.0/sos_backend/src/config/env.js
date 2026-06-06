import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "10m",

  passwordSaltRounds: Number(process.env.PASSWORD_SALT_ROUNDS) || 10,
  tokenHashSecret:
    process.env.TOKEN_HASH_SECRET ||
    "fallback_token_hash_secret_minimum_32_characters",

  orderSessionExpiresMinutes:
    Number(process.env.ORDER_SESSION_EXPIRES_MINUTES) || 30,

  corsOrigin: process.env.CORS_ORIGIN || "*",
};
