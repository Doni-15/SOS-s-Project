import fs from "node:fs";

const failures = [];

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing file`);
    return "";
  }

  return fs.readFileSync(file, "utf8");
};

const normalize = (source) => source.replace(/\s+/g, " ").trim();

const assertIncludes = ({ file, source, text, reason }) => {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

const assertMatches = ({ file, source, pattern, reason }) => {
  if (!pattern.test(normalize(source))) {
    failures.push(`${file}: pattern not found${reason ? ` - ${reason}` : ""}`);
  }
};

const appConfigFile = "src/shared/constants/appConfig.js";
const appConfig = read(appConfigFile);

for (const text of [
  "USER_ROLES",
  "OWNER",
  "CASHIER",
  "ROUTES",
  "login",
  "unauthorized",
  "publicOrder",
  "ownerDashboard",
  "ownerMenu",
  "ownerTables",
  "ownerUsers",
  "cashierOrders",
  "cashierMenu",
]) {
  assertIncludes({
    file: appConfigFile,
    source: appConfig,
    text,
  });
}

const protectedRouteFile = "src/features/auth/components/ProtectedRoute.jsx";
const protectedRoute = read(protectedRouteFile);

for (const text of [
  "allowedRoles",
  "isAuthenticated",
  "ROUTES.login",
  "ROUTES.unauthorized",
]) {
  assertIncludes({
    file: protectedRouteFile,
    source: protectedRoute,
    text,
  });
}

const appRoutesFile = "src/routes/AppRoutes.jsx";
const appRoutes = read(appRoutesFile);

for (const text of [
  "Routes",
  "Route",
  "Navigate",
  "GuestRoute",
  "ProtectedRoute",
  "CustomerOrderPage",
  "UnauthorizedPage",
  "ROUTES",
  "USER_ROLES",
]) {
  assertIncludes({
    file: appRoutesFile,
    source: appRoutes,
    text,
  });
}

assertMatches({
  file: appRoutesFile,
  source: appRoutes,
  pattern: /path=\{ROUTES\.publicOrder\} element=\{<CustomerOrderPage \/>/,
  reason: "public order route must stay public and must not use ProtectedRoute",
});

for (const route of [
  ["ownerDashboard", "OwnerDashboardPage"],
  ["ownerReports", "OwnerReportsPage"],
  ["ownerAnalytics", "OwnerAnalyticsPage"],
  ["ownerMenu", "OwnerMenuPage"],
  ["ownerTables", "OwnerTablesPage"],
  ["ownerUsers", "OwnerUsersPage"],
  ["ownerUserCreate", "OwnerUserFormPage"],
  ["ownerUserEdit", "OwnerUserFormPage"],
  ["ownerSettings", "OwnerSettingsPage"],
]) {
  const [routeName, pageName] = route;

  assertMatches({
    file: appRoutesFile,
    source: appRoutes,
    pattern: new RegExp(
      `path=\\{ROUTES\\.${routeName}\\} element=\\{ <ProtectedRoute allowedRoles=\\{\\[USER_ROLES\\.OWNER\\]\\}> <${pageName} \\/> <\\/ProtectedRoute> \\}`,
    ),
    reason: `ROUTES.${routeName} must be OWNER-only`,
  });
}

for (const route of [
  ["cashierOrders", "CashierOrdersPage"],
  ["cashierOrderDetail", "CashierOrderDetailPage"],
  ["cashierOrderPayment", "CashierPaymentPage"],
  ["cashierTransactionSuccess", "CashierTransactionSuccessPage"],
  ["cashierTransactionReceipt", "CashierReceiptPage"],
  ["cashierTransactions", "CashierTransactionsPage"],
  ["cashierMenu", "CashierMenuPage"],
]) {
  const [routeName, pageName] = route;

  assertMatches({
    file: appRoutesFile,
    source: appRoutes,
    pattern: new RegExp(
      `path=\\{ROUTES\\.${routeName}\\} element=\\{ <ProtectedRoute allowedRoles=\\{\\[USER_ROLES\\.CASHIER, USER_ROLES\\.OWNER\\]\\}> <${pageName} \\/> <\\/ProtectedRoute> \\}`,
    ),
    reason: `ROUTES.${routeName} must be CASHIER/OWNER`,
  });
}

assertMatches({
  file: appRoutesFile,
  source: appRoutes,
  pattern: /path="\*" element=\{<NotFoundPage \/>/,
  reason: "SPA must have a NotFound fallback route",
});

if (failures.length > 0) {
  console.error("Route access check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Route access check passed.");
