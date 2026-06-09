import fs from "node:fs";

const digitalReceiptFile = "src/features/customer/components/CustomerDigitalReceipt.jsx";
const trackerFile = "src/features/customer/components/CustomerOrderTracker.jsx";
const reusableReceiptFile = "src/features/transactions/components/ReceiptPreview.jsx";

for (const file of [digitalReceiptFile, trackerFile, reusableReceiptFile]) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} must exist`);
  }
}

const digitalReceipt = fs.readFileSync(digitalReceiptFile, "utf8");
const tracker = fs.readFileSync(trackerFile, "utf8");
const reusableReceipt = fs.readFileSync(reusableReceiptFile, "utf8");

for (const text of [
  "../../transactions/components/ReceiptPreview",
  "normalizeCustomerTransaction",
  "getCustomerReceipt",
  'order?.status !== "PAID"',
  "<ReceiptPreview transaction={transaction} receipt={receipt} />",
  "Pembayaran Berhasil",
  "Struk Digital Tersedia",
]) {
  if (!digitalReceipt.includes(text)) {
    throw new Error(`${digitalReceiptFile} must include "${text}"`);
  }
}

for (const text of [
  "CustomerDigitalReceipt",
  '"PAID"',
]) {
  if (!tracker.includes(text)) {
    throw new Error(`${trackerFile} must include "${text}"`);
  }
}

if (!reusableReceipt.includes("export function ReceiptPreview")) {
  throw new Error(`${reusableReceiptFile} must export ReceiptPreview`);
}

console.log("Customer receipt check passed.");
