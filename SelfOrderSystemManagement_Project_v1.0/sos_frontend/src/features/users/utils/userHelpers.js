export const ROLE_LABELS = {
  OWNER: "Pemilik",
  CASHIER: "Kasir",
};

const ROLE_ORDER = {
  OWNER: 0,
  CASHIER: 1,
};

const ACTIVE_STATUS_VALUES = new Set([
  "ACTIVE",
  "active",
  "Aktif",
  "aktif",
  "ENABLED",
  "enabled",
]);

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? role ?? "-";
}

export function getUserDisplayName(user) {
  return user?.fullName ?? user?.name ?? user?.username ?? "-";
}

export function getUserPhone(user) {
  return user?.phone ?? user?.phoneNumber ?? "";
}

export function getUserLastActivityAt(user) {
  return user?.lastLoginAt ?? user?.lastLogin ?? user?.updatedAt ?? user?.createdAt;
}

export function getIsUserActive(user) {
  if (!user) {
    return false;
  }

  if (typeof user.isActive === "boolean") {
    return user.isActive;
  }

  if (typeof user.is_active === "boolean") {
    return user.is_active;
  }

  if (typeof user.active === "boolean") {
    return user.active;
  }

  if (typeof user.status === "string") {
    return ACTIVE_STATUS_VALUES.has(user.status);
  }

  return true;
}

export function isSameUser(currentUser, rowUser) {
  if (!currentUser || !rowUser) {
    return false;
  }

  return (
    currentUser.id === rowUser.id ||
    currentUser.username === rowUser.username
  );
}

export function sortUsersByRole(users = []) {
  return [...users].sort((a, b) => {
    const roleA = ROLE_ORDER[a?.role] ?? 99;
    const roleB = ROLE_ORDER[b?.role] ?? 99;

    if (roleA !== roleB) {
      return roleA - roleB;
    }

    return String(a?.username ?? "").localeCompare(String(b?.username ?? ""));
  });
}

export function buildUserPayload(form, { includePassword = false } = {}) {
  const payload = {
    fullName: form.fullName.trim(),
    name: form.fullName.trim(),
    username: form.username.trim(),
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    phoneNumber: form.phone.trim() || null,
    role: form.role,
    isActive: form.isActive,
  };

  if (includePassword && form.password) {
    payload.password = form.password;
  }

  return payload;
}
