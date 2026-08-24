const getRequiredValue = (runtimeEnv, key, { minLength = 1 } = {}) => {
  const value = runtimeEnv[key]?.trim();

  if (!value || value.length < minLength) {
    throw new Error(`${key} is required and must be at least ${minLength} characters`);
  }

  return value;
};

export const getBootstrapUsers = (runtimeEnv = process.env) => {
  if (runtimeEnv.NODE_ENV !== "production") {
    throw new Error("Production bootstrap requires NODE_ENV=production");
  }

  const owner = {
    username: getRequiredValue(runtimeEnv, "BOOTSTRAP_OWNER_USERNAME", {
      minLength: 3,
    }),
    password: getRequiredValue(runtimeEnv, "BOOTSTRAP_OWNER_PASSWORD", {
      minLength: 16,
    }),
    fullName: "Pemilik Usaha",
    phone: null,
    role: "OWNER",
  };
  const cashier = {
    username: getRequiredValue(runtimeEnv, "BOOTSTRAP_CASHIER_USERNAME", {
      minLength: 3,
    }),
    password: getRequiredValue(runtimeEnv, "BOOTSTRAP_CASHIER_PASSWORD", {
      minLength: 16,
    }),
    fullName: "Kasir Awal",
    phone: null,
    role: "CASHIER",
  };

  if (owner.username === cashier.username) {
    throw new Error("Bootstrap usernames must be different");
  }

  if (owner.password === cashier.password) {
    throw new Error("Bootstrap passwords must be different");
  }

  for (const user of [owner, cashier]) {
    if (user.password.toLowerCase().includes(user.username.toLowerCase())) {
      throw new Error(`Bootstrap password for ${user.role} must not contain its username`);
    }
  }

  return [owner, cashier];
};
