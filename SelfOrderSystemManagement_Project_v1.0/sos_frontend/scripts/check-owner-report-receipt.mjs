import fs from "node:fs";

const ownerReportsFile = "src/features/owner/pages/OwnerReportsPage.jsx";
const reusableReceiptFile = "src/features/transactions/components/ReceiptPreview.jsx";

for (const file of [ownerReportsFile, reusableReceiptFile]) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} must exist`);
  }
}

const ownerReports = fs.readFileSync(ownerReportsFile, "utf8");
const reusableReceipt = fs.readFileSync(reusableReceiptFile, "utf8");

for (const text of [
  "../../transactions/components/ReceiptPreview",
  "function getReceiptForTransaction(transaction)",
  "function OwnerReceiptDialog",
  "selectedReceiptTransaction",
  "setSelectedReceiptTransaction(transaction)",
  "<ReceiptPreview transaction={transaction} receipt={receipt} />",
  "Lihat Struk",
  "Belum Ada Struk",
  "Cetak Struk",
]) {
  if (!ownerReports.includes(text)) {
    throw new Error(`${ownerReportsFile} must include "${text}"`);
  }
}

if (!reusableReceipt.includes("export function ReceiptPreview")) {
  throw new Error(`${reusableReceiptFile} must export ReceiptPreview`);
}

console.log("Owner report receipt check passed.");
