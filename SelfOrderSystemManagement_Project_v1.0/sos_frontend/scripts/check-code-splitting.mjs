import fs from "node:fs";

const failures = [];

const file = "src/routes/AppRoutes.jsx";
const source = fs.readFileSync(file, "utf8");

const assertIncludes = (text, reason = "") => {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

const assertNotIncludes = (text, reason = "") => {
  if (source.includes(text)) {
    failures.push(`${file}: must not include "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

for (const text of [
  "lazy",
  "Suspense",
  "lazyNamed",
  "fallback={<PageLoader />}",
  'import("../features/auth/pages/LoginPage")',
  'import("../features/customer/pages/CustomerOrderPage")',
  'import("../features/cashier/pages/CashierOrdersPage")',
  'import("../features/owner/pages/OwnerDashboardPage")',
]) {
  assertIncludes(text, "route pages should be code-split");
}

for (const forbidden of [
  'import { LoginPage } from',
  'import { CustomerOrderPage } from',
  'import { CashierOrdersPage } from',
  'import { OwnerDashboardPage } from',
  'import { OwnerMenuPage } from',
]) {
  assertNotIncludes(forbidden, "route page imports should be lazy");
}

if (failures.length > 0) {
  console.error("Code splitting check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Code splitting check passed.");
