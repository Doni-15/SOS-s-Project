import {
  getDailySales,
  getSalesSummary,
  getTopMenuItems,
} from "../src/modules/report/report.service.js";

const today = new Date().toISOString().slice(0, 10);

const assertObject = (label, value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must return an object`);
  }
};

const assertArray = (label, value) => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must return an array`);
  }
};

const summary = await getSalesSummary({
  startDate: today,
  endDate: today,
  period: "daily",
});

assertObject("sales summary", summary);

for (const key of [
  "totalRevenue",
  "totalTransactions",
  "averageTransaction",
  "totalItems",
]) {
  if (typeof summary[key] !== "number" || Number.isNaN(summary[key])) {
    throw new Error(`sales summary ${key} must be a valid number`);
  }
}

const daily = await getDailySales({
  startDate: today,
  endDate: today,
  period: "daily",
});

assertObject("daily sales response", daily);
assertArray("dailySales", daily.dailySales);

const topMenu = await getTopMenuItems({
  startDate: today,
  endDate: today,
  period: "daily",
  limit: 10,
});

assertObject("top menu response", topMenu);
assertArray("topMenuItems", topMenu.topMenuItems);

console.log("Report service check passed.");

process.exit(0);
