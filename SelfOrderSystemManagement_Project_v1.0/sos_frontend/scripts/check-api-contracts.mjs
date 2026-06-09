import fs from "node:fs";

const failures = [];

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing file`);
    return "";
  }

  return fs.readFileSync(file, "utf8");
};

const assertIncludes = ({ file, source, text, reason }) => {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

const assertAnyIncludes = ({ file, source, options, reason }) => {
  if (!options.some((text) => source.includes(text))) {
    failures.push(
      `${file}: missing one of ${options.map((text) => `"${text}"`).join(", ")}${
        reason ? ` - ${reason}` : ""
      }`,
    );
  }
};

const envExample = read(".env.example");
assertIncludes({
  file: ".env.example",
  source: envExample,
  text: "VITE_API_BASE_URL",
  reason: "frontend must know backend API base URL",
});
assertIncludes({
  file: ".env.example",
  source: envExample,
  text: "VITE_PUBLIC_ORDER_BASE_URL",
  reason: "QR customer URL must be configurable",
});

const appConfigFile = "src/shared/constants/appConfig.js";
const appConfig = read(appConfigFile);

for (const text of [
  "VITE_API_BASE_URL",
  "VITE_PUBLIC_ORDER_BASE_URL",
  "apiBaseUrl",
  "publicOrderBaseUrl",
  'publicOrder: "/order"',
]) {
  assertIncludes({
    file: appConfigFile,
    source: appConfig,
    text,
  });
}

const apiClientFile = "src/shared/api/apiClient.js";
const apiClient = read(apiClientFile);

for (const text of [
  "axios",
  "baseURL",
  "appConfig.apiBaseUrl",
  "Authorization",
  "Bearer",
]) {
  assertIncludes({
    file: apiClientFile,
    source: apiClient,
    text,
  });
}

const orderConstantsFile = "src/features/orders/constants/orderConstants.js";
const orderConstants = read(orderConstantsFile);

for (const text of [
  "/internal/orders",
  "/accept",
  "/served",
  "/cancel",
  "SUBMITTED",
  "ACCEPTED",
  "SERVED",
  "PAID",
  "CANCELLED",
  "EXPIRED",
]) {
  assertIncludes({
    file: orderConstantsFile,
    source: orderConstants,
    text,
  });
}

const orderApiFile = "src/features/orders/api/orderApi.js";
const orderApi = read(orderApiFile);

for (const text of [
  "getOrders",
  "getOrderById",
  "acceptOrder",
  "cancelOrder",
]) {
  assertIncludes({
    file: orderApiFile,
    source: orderApi,
    text,
  });
}

assertAnyIncludes({
  file: orderApiFile,
  source: orderApi,
  options: ["markOrderServed", "markServed", "servedOrder"],
  reason: "cashier must be able to mark ACCEPTED order as SERVED",
});

const markServedHookFile = "src/features/orders/hooks/useMarkOrderServed.js";
const markServedHook = read(markServedHookFile);

assertIncludes({
  file: markServedHookFile,
  source: markServedHook,
  text: "useMutation",
});
assertIncludes({
  file: markServedHookFile,
  source: markServedHook,
  text: "ORDER_QUERY_KEYS",
});

const customerApiFile = "src/features/customer/api/customerOrderApi.js";
const customerApi = read(customerApiFile);

for (const text of [
  "/public/qr/validate",
  "/public/menu",
  "/public/orders",
]) {
  assertIncludes({
    file: customerApiFile,
    source: customerApi,
    text,
  });
}

const appRoutesFile = "src/routes/AppRoutes.jsx";
const appRoutes = read(appRoutesFile);

for (const text of [
  "CustomerOrderPage",
  "publicOrder",
]) {
  assertIncludes({
    file: appRoutesFile,
    source: appRoutes,
    text,
  });
}

const tableApiFile = "src/features/tables/api/tableApi.js";
const tableApi = read(tableApiFile);

for (const text of [
  "getTableQrTokens",
  "generateTableQrToken",
  "revokeQrToken",
  "API_ENDPOINTS.tables.qrTokens",
  "API_ENDPOINTS.tables.revokeQrToken",
]) {
  assertIncludes({
    file: tableApiFile,
    source: tableApi,
    text,
  });
}

for (const text of [
  "qr-tokens",
  "revokeQrToken",
  "qrTokens",
]) {
  assertIncludes({
    file: appConfigFile,
    source: appConfig,
    text,
  });
}

const ownerTablesFile = "src/features/owner/pages/OwnerTablesPage.jsx";
const ownerTables = read(ownerTablesFile);

assertIncludes({
  file: ownerTablesFile,
  source: ownerTables,
  text: "publicOrderBaseUrl",
  reason: "owner QR must use configurable public order URL",
});

const cashierOrderDetailFile =
  "src/features/cashier/pages/CashierOrderDetailPage.jsx";
const cashierOrderDetail = read(cashierOrderDetailFile);

for (const text of [
  "useMarkOrderServed",
  "markServedMutation",
  "SERVED",
  "Bayar Pesanan",
]) {
  assertIncludes({
    file: cashierOrderDetailFile,
    source: cashierOrderDetail,
    text,
  });
}

if (failures.length > 0) {
  console.error("Frontend API contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Frontend API contract check passed.");
