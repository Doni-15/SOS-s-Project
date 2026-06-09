import fs from "node:fs";

const routesPath = "src/modules/menu/menu.routes.js";

if (!fs.existsSync(routesPath)) {
  throw new Error(`${routesPath} must exist`);
}

const routes = fs.readFileSync(routesPath, "utf8");

function mustMatch(regex, message) {
  if (!regex.test(routes)) {
    throw new Error(message);
  }
}

function mustNotMatch(regex, message) {
  if (regex.test(routes)) {
    throw new Error(message);
  }
}

mustMatch(
  /router\.use\(\s*authorizeRoles\(\s*"OWNER"\s*,\s*"CASHIER"\s*\)\s*\)/s,
  'menu module must be accessible by OWNER and CASHIER'
);

mustMatch(
  /router\.post\(\s*"\/menu-items"\s*,\s*authorizeRoles\(\s*"OWNER"\s*\)\s*,\s*createMenuItemController\s*\)/s,
  'menu item create must be OWNER only'
);

mustMatch(
  /router\.patch\(\s*"\/menu-items\/:id"\s*,\s*authorizeRoles\(\s*"OWNER"\s*,\s*"CASHIER"\s*\)\s*,\s*updateMenuItemController\s*\)/s,
  'menu item update must be allowed for OWNER and CASHIER'
);

mustMatch(
  /router\.delete\(\s*"\/menu-items\/:id"\s*,\s*authorizeRoles\(\s*"OWNER"\s*\)\s*,\s*deleteMenuItemController\s*\)/s,
  'menu item delete must be OWNER only'
);

mustNotMatch(
  /router\.post\(\s*"\/menu-items"\s*,\s*createMenuItemController\s*\)/s,
  'menu item create must not be open without OWNER guard'
);

mustNotMatch(
  /router\.delete\(\s*"\/menu-items\/:id"\s*,\s*deleteMenuItemController\s*\)/s,
  'menu item delete must not be open without OWNER guard'
);

console.log("Cashier menu update access check passed.");
