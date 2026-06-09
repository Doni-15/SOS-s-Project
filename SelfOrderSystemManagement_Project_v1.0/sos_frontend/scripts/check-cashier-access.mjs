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

const assertNotIncludes = ({ file, source, text, reason }) => {
  if (source.includes(text)) {
    failures.push(`${file}: must not include "${text}"${reason ? ` - ${reason}` : ""}`);
  }
};

const cashierMenuFile = "src/features/cashier/pages/CashierMenuPage.jsx";
const cashierMenu = read(cashierMenuFile);

for (const text of [
  "CashierShell",
  "useMenuItems",
  "MenuStatusBadge",
  "Kelola Ketersediaan Menu",
  "useUpdateMenuItem",
  "availabilityStatus",
  "Tandai Tersedia",
  "Tandai Habis",
]) {
  assertIncludes({
    file: cashierMenuFile,
    source: cashierMenu,
    text,
  });
}

for (const forbidden of [
  "OwnerMenuPage",
  "MenuItemForm",
  "useCreateMenuItem",
  "useDeleteMenuItem",
  "useCreateMenuCategory",
  "createMenuItem",
  "updateMenuItem",
  "deleteMenuItem",
]) {
  assertNotIncludes({
    file: cashierMenuFile,
    source: cashierMenu,
    text: forbidden,
    reason: "cashier menu page may update menu availability status",
  });
}

const appRoutesFile = "src/routes/AppRoutes.jsx";
const appRoutes = read(appRoutesFile);

assertIncludes({
  file: appRoutesFile,
  source: appRoutes,
  text: "CashierMenuPage",
});

assertIncludes({
  file: appRoutesFile,
  source: appRoutes,
  text: "ROUTES.cashierMenu",
});

if (failures.length > 0) {
  console.error("Cashier access check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Cashier access check passed.");
