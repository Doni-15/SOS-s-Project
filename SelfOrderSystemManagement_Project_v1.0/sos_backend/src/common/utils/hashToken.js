import crypto from "crypto";
import { env } from "../../config/env.js";

export const hashToken = (token) => {
  return crypto
    .createHmac("sha256", env.tokenHashSecret)
    .update(token)
    .digest("hex");
};
