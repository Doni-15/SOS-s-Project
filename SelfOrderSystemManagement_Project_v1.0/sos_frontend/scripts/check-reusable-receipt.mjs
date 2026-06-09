import fs from "node:fs";

const reusableFile = "src/features/transactions/components/ReceiptPreview.jsx";
const cashierWrapperFile = "src/features/cashier/components/CashierReceiptPreview.jsx";
const cashierReceiptPageFile = "src/features/cashier/pages/CashierReceiptPage.jsx";

for (const file of [reusableFile, cashierWrapperFile, cashierReceiptPageFile]) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} must exist`);
  }
}

const reusable = fs.readFileSync(reusableFile, "utf8");
const wrapper = fs.readFileSync(cashierWrapperFile, "utf8");
const page = fs.readFileSync(cashierReceiptPageFile, "utf8");

for (const text of [
  "export function ReceiptPreview",
  "RECEIPT_LOGO_SRC",
  "Kedai Nusantara",
  "rounded-2xl",
  "getReceiptNumber",
  "../../cashier/utils/cashierOrderHelpers",
]) {
  if (!reusable.includes(text)) {
    throw new Error(`${reusableFile} must include "${text}"`);
  }
}

if (reusable.includes("export function CashierReceiptPreview")) {
  throw new Error(`${reusableFile} must not export CashierReceiptPreview`);
}

if (!wrapper.includes("ReceiptPreview as CashierReceiptPreview")) {
  throw new Error(`${cashierWrapperFile} must re-export ReceiptPreview as CashierReceiptPreview`);
}

if (!page.includes("../../transactions/components/ReceiptPreview")) {
  throw new Error(`${cashierReceiptPageFile} must import reusable ReceiptPreview`);
}

if (!page.includes("<ReceiptPreview")) {
  throw new Error(`${cashierReceiptPageFile} must render ReceiptPreview`);
}

console.log("Reusable receipt check passed.");
