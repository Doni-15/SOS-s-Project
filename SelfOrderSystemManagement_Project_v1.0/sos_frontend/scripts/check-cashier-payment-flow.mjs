import fs from "node:fs";

const paymentPageFile = "src/features/cashier/pages/CashierPaymentPage.jsx";
const detailPageFile = "src/features/cashier/pages/CashierOrderDetailPage.jsx";
const helperFile = "src/features/cashier/utils/cashierOrderHelpers.js";
const orderConstantsFile = "src/features/orders/constants/orderConstants.js";
const transactionApiFile = "src/features/transactions/api/transactionApi.js";

const paymentPage = fs.readFileSync(paymentPageFile, "utf8");
const detailPage = fs.readFileSync(detailPageFile, "utf8");
const helper = fs.readFileSync(helperFile, "utf8");
const orderConstants = fs.readFileSync(orderConstantsFile, "utf8");
const transactionApi = fs.readFileSync(transactionApiFile, "utf8");

for (const text of [
  'status === "SERVED"',
  'status !== "SERVED"',
  "dihidangkan",
]) {
  if (!paymentPage.includes(text)) {
    throw new Error(`${paymentPageFile} must include "${text}"`);
  }
}

if (paymentPage.includes('status === "ACCEPTED" && numericPaidAmount')) {
  throw new Error(`${paymentPageFile} still allows payment from ACCEPTED status`);
}

if (paymentPage.includes('status !== "ACCEPTED"')) {
  throw new Error(`${paymentPageFile} still blocks non-ACCEPTED instead of non-SERVED`);
}

for (const text of [
  '"SERVED"',
  'SERVED: "Dihidangkan"',
]) {
  if (!helper.includes(text)) {
    throw new Error(`${helperFile} must include "${text}"`);
  }
}

if (!orderConstants.includes('"SERVED"')) {
  throw new Error(`${orderConstantsFile} must include SERVED status`);
}

if (!transactionApi.includes('payOrder: (orderId) => `/internal/orders/${orderId}/payments`')) {
  throw new Error(`${transactionApiFile} must use internal payment endpoint`);
}

if (!detailPage.includes('"SERVED"')) {
  throw new Error(`${detailPageFile} should include SERVED flow handling`);
}

console.log("Cashier payment flow check passed.");
