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

const customerApiFile = "src/features/customer/api/customerOrderApi.js";
const customerApi = read(customerApiFile);

for (const text of [
  "validateQrToken",
  "getPublicMenu",
  "submitOrder",
  "getOrderTracking",
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

assertAnyIncludes({
  file: customerApiFile,
  source: customerApi,
  options: ['"x-order-session-token"', "'x-order-session-token'"],
  reason: "tracking request should send order session token header",
});

const customerHookFile = "src/features/customer/hooks/useCustomerOrder.js";
const customerHook = read(customerHookFile);

for (const text of [
  "CUSTOMER_QUERY_KEYS",
  "useCustomerOrderSession",
  "useCustomerPublicMenu",
  "useSubmitCustomerOrder",
  "useCustomerOrderTracking",
  "refetchInterval",
  "PAID",
  "CANCELLED",
  "EXPIRED",
]) {
  assertIncludes({
    file: customerHookFile,
    source: customerHook,
    text,
  });
}

const customerHelperFile = "src/features/customer/utils/customerOrderHelpers.js";
const customerHelper = read(customerHelperFile);

for (const text of [
  "buildSubmitOrderPayload",
  "saveCustomerTrackingSession",
  "getSavedCustomerTrackingSession",
  "clearCustomerTrackingSession",
  "orderSessionId",
  "orderSessionToken",
]) {
  assertIncludes({
    file: customerHelperFile,
    source: customerHelper,
    text,
  });
}

const customerPageFile = "src/features/customer/pages/CustomerOrderPage.jsx";
const customerPage = read(customerPageFile);

for (const text of [
  "useSearchParams",
  "token",
  "useCustomerOrderSession",
  "useCustomerPublicMenu",
  "useSubmitCustomerOrder",
  "useCustomerOrderTracking",
  "buildSubmitOrderPayload",
  "saveCustomerTrackingSession",
  "getSavedCustomerTrackingSession",
  "clearCustomerTrackingSession",
  "CustomerCartPanel",
  "CustomerMenuCard",
  "CustomerOrderTracker",
]) {
  assertIncludes({
    file: customerPageFile,
    source: customerPage,
    text,
  });
}

assertAnyIncludes({
  file: customerPageFile,
  source: customerPage,
  options: ["customerName", "Pelanggan", "Nama"],
  reason: "customer identity/name should be handled in public order flow",
});

const appRoutesFile = "src/routes/AppRoutes.jsx";
const appRoutes = read(appRoutesFile);

for (const text of [
  "CustomerOrderPage",
  "ROUTES.publicOrder",
]) {
  assertIncludes({
    file: appRoutesFile,
    source: appRoutes,
    text,
  });
}

const appConfigFile = "src/shared/constants/appConfig.js";
const appConfig = read(appConfigFile);

for (const text of [
  'publicOrder: "/order"',
  "publicOrderBaseUrl",
  "VITE_PUBLIC_ORDER_BASE_URL",
]) {
  assertIncludes({
    file: appConfigFile,
    source: appConfig,
    text,
  });
}

const ownerTablesFile = "src/features/owner/pages/OwnerTablesPage.jsx";
const ownerTables = read(ownerTablesFile);

for (const text of [
  "publicOrderBaseUrl",
  "tokenValue",
  "ROUTES.publicOrder",
  "encodeURIComponent",
]) {
  assertIncludes({
    file: ownerTablesFile,
    source: ownerTables,
    text,
    reason: "owner QR should point to public customer order route",
  });
}

if (failures.length > 0) {
  console.error("Customer QR flow check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Customer QR flow check passed.");
