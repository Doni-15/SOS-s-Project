import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import test from "node:test";

const importEnvModule = (overrides = {}) => {
  const runtimeSecret = crypto.randomBytes(32).toString("base64url");
  const runtimeEnv = {
    PATH: process.env.PATH,
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://localhost:5432/sos_test?schema=public",
    JWT_SECRET: runtimeSecret,
    TOKEN_HASH_SECRET: `${runtimeSecret}-token`,
    CORS_ORIGIN: "https://frontend.example.invalid",
    PUBLIC_BASE_URL: "https://api.example.invalid",
    ...overrides,
  };

  for (const [key, value] of Object.entries(runtimeEnv)) {
    if (value === undefined) delete runtimeEnv[key];
  }

  return spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", 'import("./src/config/env.js")'],
    {
      cwd: process.cwd(),
      env: runtimeEnv,
      encoding: "utf8",
    }
  );
};

test("runtime configuration requires an explicit environment", () => {
  const result = importEnvModule({ NODE_ENV: undefined });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NODE_ENV is required/);
});

test("production requires a canonical public base URL", () => {
  const result = importEnvModule({ PUBLIC_BASE_URL: undefined });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PUBLIC_BASE_URL is required/);
});

test("production rejects a cleartext public base URL", () => {
  const result = importEnvModule({
    PUBLIC_BASE_URL: "http://api.example.invalid",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must use HTTPS/);
});

test("production accepts explicit HTTPS origins", () => {
  const result = importEnvModule();

  assert.equal(result.status, 0, result.stderr);
});
