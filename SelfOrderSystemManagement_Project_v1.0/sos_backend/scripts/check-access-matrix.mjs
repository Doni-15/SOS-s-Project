import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

const failures = [];

const normalize = (source) => source.replace(/\s+/g, " ").trim();

const escapeRegExp = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const assertIncludes = ({ file, source, text, reason }) => {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

const assertNotIncludes = ({ file, source, text, reason }) => {
  if (source.includes(text)) {
    failures.push(`${file}: must not include "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

const assertRouteExists = ({
  file,
  source,
  method,
  path,
  controller,
  middleware,
  reason,
  text,
}) => {
  if (text) {
    if (!source.includes(text)) {
      failures.push(`${file}: missing required text - ${reason}`);
    }

    return;
  }

  const compact = normalize(source);

  const middlewarePattern = middleware
    ? `\\s*,\\s*${middleware}`
    : "";

  const controllerPattern = controller
    ? `\\s*,\\s*${controller}`
    : "";

  const pattern = new RegExp(
    `router\\.${method}\\s*\\(\\s*["']${escapeRegExp(path)}["']${middlewarePattern}${controllerPattern}`,
  );

  if (!pattern.test(compact)) {
    failures.push(
      `${file}: route not found - ${method.toUpperCase()} ${path}${reason ? ` - ${reason}` : ""}`,
    );
  }
};

const publicRoutesFile = "src/modules/publicOrder/publicOrder.routes.js";
const publicRoutes = read(publicRoutesFile);

assertNotIncludes({
  file: publicRoutesFile,
  source: publicRoutes,
  text: "authenticate",
  reason: "public customer flow must not require internal JWT auth",
});

assertNotIncludes({
  file: publicRoutesFile,
  source: publicRoutes,
  text: "authorizeRoles",
  reason: "public customer flow must not require OWNER/CASHIER role",
});

for (const route of [
  {
    method: "post",
    path: "/qr/validate",
    controller: "validateQrTokenController",
  },
  {
    method: "get",
    path: "/menu",
    controller: "getPublicMenuController",
  },
  {
    method: "post",
    path: "/orders",
    controller: "submitCustomerOrderController",
  },
  {
    method: "get",
    path: "/orders/:id",
    controller: "getCustomerOrderTrackingController",
  },
]) {
  assertRouteExists({
    file: publicRoutesFile,
    source: publicRoutes,
    ...route,
    reason: "PUBLIC route must exist",
  });
}

const menuRoutesFile = "src/modules/menu/menu.routes.js";
const menuRoutes = read(menuRoutesFile);

assertIncludes({
  file: menuRoutesFile,
  source: menuRoutes,
  text: "router.use(authenticate);",
});

assertIncludes({
  file: menuRoutesFile,
  source: menuRoutes,
  text: 'router.use(authorizeRoles("OWNER", "CASHIER"));',
});

for (const route of [
  {
    method: "post",
    path: "/menu-categories",
    controller: "createMenuCategoryController",
  },
  {
    method: "post",
    path: "/menu-items",
    controller: "createMenuItemController",
  },
  {
    file: "src/modules/menu/menu.routes.js",
    text: 'router.patch("/menu-items/:id", authorizeRoles("OWNER", "CASHIER"), updateMenuItemController);',
    reason: "PATCH /menu-items/:id - must allow OWNER and CASHIER",
  },
  {
    method: "delete",
    path: "/menu-items/:id",
    controller: "deleteMenuItemController",
  },
]) {
  assertRouteExists({
    file: menuRoutesFile,
    source: menuRoutes,
    ...route,
    middleware: 'authorizeRoles\\("OWNER"\\)',
    reason: "must allow OWNER and CASHIER",
  });
}

const paymentRoutesFile = "src/modules/payment/payment.routes.js";
const paymentRoutes = read(paymentRoutesFile);

assertIncludes({
  file: paymentRoutesFile,
  source: paymentRoutes,
  text: "router.use(authenticate);",
});

assertIncludes({
  file: paymentRoutesFile,
  source: paymentRoutes,
  text: 'router.use(authorizeRoles("OWNER", "CASHIER"));',
});

const reportRoutesFile = "src/modules/report/report.routes.js";
const reportRoutes = read(reportRoutesFile);

assertIncludes({
  file: reportRoutesFile,
  source: reportRoutes,
  text: "router.use(authenticate);",
});

for (const route of [
  {
    method: "get",
    path: "/reports/sales-summary",
    controller: "getSalesSummaryController",
  },
  {
    method: "get",
    path: "/reports/daily-sales",
    controller: "getDailySalesController",
  },
  {
    method: "get",
    path: "/reports/top-menu-items",
    controller: "getTopMenuItemsController",
  },
]) {
  assertRouteExists({
    file: reportRoutesFile,
    source: reportRoutes,
    ...route,
    middleware: 'authorizeRoles\\("OWNER"\\)',
    reason: "must be OWNER-only",
  });
}

const auditRoutesFile = "src/modules/auditLog/auditLog.routes.js";
const auditRoutes = read(auditRoutesFile);

assertIncludes({
  file: auditRoutesFile,
  source: auditRoutes,
  text: "router.use(authenticate);",
});

for (const route of [
  {
    method: "get",
    path: "/audit-logs",
    controller: "getAuditLogsController",
  },
  {
    method: "get",
    path: "/audit-logs/:id",
    controller: "getAuditLogDetailController",
  },
]) {
  assertRouteExists({
    file: auditRoutesFile,
    source: auditRoutes,
    ...route,
    middleware: 'authorizeRoles\\("OWNER"\\)',
    reason: "must be OWNER-only",
  });
}

const docsFile = "docs/API_ACCESS_MATRIX.md";
const docs = read(docsFile);

for (const text of [
  "PUBLIC",
  "CASHIER",
  "OWNER",
  "POST /api/public/qr/validate",
  "POST /api/internal/menu-items",
  "GET /api/health/ready",
]) {
  assertIncludes({
    file: docsFile,
    source: docs,
    text,
  });
}

if (failures.length > 0) {
  console.error("Access matrix check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Access matrix check passed.");
