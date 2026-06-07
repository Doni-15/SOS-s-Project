import { appConfig } from "../constants/appConfig";

const storages = [localStorage, sessionStorage];

const safeJsonParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const removeFromAllStorages = (key) => {
  for (const storage of storages) {
    storage.removeItem(key);
  }
};

const readSessionFromStorage = (storage) => {
  const accessToken = storage.getItem(appConfig.authTokenKey);
  const rawUser = storage.getItem(appConfig.authUserKey);
  const expiresAt = storage.getItem(appConfig.authExpiresAtKey);

  if (!accessToken || !rawUser) {
    return null;
  }

  const user = safeJsonParse(rawUser);

  if (!user) {
    return null;
  }

  return {
    accessToken,
    tokenType: "Bearer",
    expiresAt,
    user,
  };
};

const isExpired = (expiresAt) => {
  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return true;
  }

  return expiresAtTime <= Date.now();
};

export const authStorage = {
  saveSession({ accessToken, tokenType = "Bearer", expiresAt, user, rememberMe = false }) {
    this.clearSession();

    const targetStorage = rememberMe ? localStorage : sessionStorage;

    targetStorage.setItem(appConfig.authTokenKey, accessToken);
    targetStorage.setItem(appConfig.authUserKey, JSON.stringify(user));

    if (expiresAt) {
      targetStorage.setItem(appConfig.authExpiresAtKey, expiresAt);
    }

    localStorage.setItem(appConfig.authRememberKey, rememberMe ? "true" : "false");

    return {
      accessToken,
      tokenType,
      expiresAt: expiresAt ?? null,
      user,
    };
  },

  updateUser(user) {
    const session = this.getSession();

    if (!session) {
      return null;
    }

    return this.saveSession({
      ...session,
      user,
      rememberMe: this.getRememberMe(),
    });
  },

  getSession() {
    const session =
      readSessionFromStorage(localStorage) ?? readSessionFromStorage(sessionStorage);

    if (!session) {
      return null;
    }

    if (isExpired(session.expiresAt)) {
      this.clearSession();
      return null;
    }

    return session;
  },

  hasValidSession() {
    const session = this.getSession();
    return Boolean(session?.accessToken && session?.user);
  },

  getToken() {
    return this.getSession()?.accessToken ?? null;
  },

  getUser() {
    return this.getSession()?.user ?? null;
  },

  getExpiresAt() {
    return this.getSession()?.expiresAt ?? null;
  },

  getRememberMe() {
    return localStorage.getItem(appConfig.authRememberKey) === "true";
  },

  clearSession() {
    removeFromAllStorages(appConfig.authTokenKey);
    removeFromAllStorages(appConfig.authUserKey);
    removeFromAllStorages(appConfig.authExpiresAtKey);
    removeFromAllStorages(appConfig.authRememberKey);
  },
};
