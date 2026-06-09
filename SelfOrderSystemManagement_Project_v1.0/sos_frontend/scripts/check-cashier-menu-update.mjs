import fs from "node:fs";

const pagePath = "src/features/cashier/pages/CashierMenuPage.jsx";
const apiPath = "src/features/menu/api/menuApi.js";
const mutationsPath = "src/features/menu/hooks/useMenuMutations.js";

for (const file of [pagePath, apiPath, mutationsPath]) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} must exist`);
  }
}

const page = fs.readFileSync(pagePath, "utf8");
const api = fs.readFileSync(apiPath, "utf8");
const mutations = fs.readFileSync(mutationsPath, "utf8");

for (const text of [
  "CashierShell",
  "useMenuItems",
  "useUpdateMenuItem",
  "handleUpdateAvailability",
  "availabilityStatus",
  "MenuStatusBadge",
  "Tandai Tersedia",
  "Tandai Habis",
]) {
  if (!page.includes(text)) {
    throw new Error(`CashierMenuPage.jsx must support cashier menu update using "${text}"`);
  }
}

for (const forbidden of [
  "useCreateMenuItem",
  "useDeleteMenuItem",
  "OwnerMenuPage",
]) {
  if (page.includes(forbidden)) {
    throw new Error(`CashierMenuPage.jsx should not expose owner-only menu management using "${forbidden}"`);
  }
}

for (const text of [
  "updateMenuItem",
  "apiClient.patch",
  "itemDetail(id)",
]) {
  if (!api.includes(text)) {
    throw new Error(`menuApi.js must support updating menu item using "${text}"`);
  }
}

for (const text of [
  "useUpdateMenuItem",
  "invalidateQueries",
  "QUERY_KEYS.menu.all",
]) {
  if (!mutations.includes(text)) {
    throw new Error(`useMenuMutations.js must support update mutation using "${text}"`);
  }
}

console.log("Cashier menu update frontend check passed.");
