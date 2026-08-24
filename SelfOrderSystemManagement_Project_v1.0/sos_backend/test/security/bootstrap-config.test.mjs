import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import { getBootstrapUsers } from "../../scripts/lib/bootstrap-config.mjs";

const ownerTestSecret = crypto.randomBytes(24).toString("base64url");
const cashierTestSecret = crypto.randomBytes(24).toString("base64url");

const validRuntimeEnv = {
  NODE_ENV: "production",
  BOOTSTRAP_OWNER_USERNAME: "initial-owner",
  BOOTSTRAP_OWNER_PASSWORD: ownerTestSecret,
  BOOTSTRAP_CASHIER_USERNAME: "initial-cashier",
  BOOTSTRAP_CASHIER_PASSWORD: cashierTestSecret,
};

test("production bootstrap fails closed when a runtime secret is missing", () => {
  const runtimeEnv = { ...validRuntimeEnv };
  delete runtimeEnv.BOOTSTRAP_OWNER_PASSWORD;

  assert.throws(() => getBootstrapUsers(runtimeEnv), /BOOTSTRAP_OWNER_PASSWORD/);
});

test("production bootstrap rejects development mode", () => {
  assert.throws(
    () => getBootstrapUsers({ ...validRuntimeEnv, NODE_ENV: "development" }),
    /NODE_ENV=production/
  );
});

test("production bootstrap rejects shared credentials", () => {
  assert.throws(
    () =>
      getBootstrapUsers({
        ...validRuntimeEnv,
        BOOTSTRAP_CASHIER_PASSWORD: validRuntimeEnv.BOOTSTRAP_OWNER_PASSWORD,
      }),
    /passwords must be different/
  );
});

test("production bootstrap accepts distinct runtime-only credentials", () => {
  const users = getBootstrapUsers(validRuntimeEnv);

  assert.deepEqual(
    users.map(({ role, username }) => ({ role, username })),
    [
      { role: "OWNER", username: "initial-owner" },
      { role: "CASHIER", username: "initial-cashier" },
    ]
  );
});
