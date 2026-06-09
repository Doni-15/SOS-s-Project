import fs from "node:fs";

const checks = [
  {
    file: "src/common/repositories/order.includes.js",
    required: [
      "USER_SUMMARY_SELECT",
      "TABLE_SUMMARY_SELECT",
      "ORDER_RESPONSE_INCLUDE",
      "ORDER_LIST_INCLUDE",
      "ORDER_FOR_PAYMENT_INCLUDE",
      "TRANSACTION_RESPONSE_INCLUDE",
      "RECEIPT_RESPONSE_INCLUDE",
    ],
  },
  {
    file: "src/modules/internalOrder/internalOrder.repository.js",
    required: [
      "ORDER_LIST_INCLUDE",
      "ORDER_RESPONSE_INCLUDE",
      "include: ORDER_LIST_INCLUDE",
      "include: ORDER_RESPONSE_INCLUDE",
    ],
  },
  {
    file: "src/modules/payment/payment.repository.js",
    required: [
      "ORDER_FOR_PAYMENT_INCLUDE",
      "TRANSACTION_RESPONSE_INCLUDE",
      "RECEIPT_RESPONSE_INCLUDE",
      "include: ORDER_FOR_PAYMENT_INCLUDE",
      "include: TRANSACTION_RESPONSE_INCLUDE",
      "include: RECEIPT_RESPONSE_INCLUDE",
    ],
  },
  {
    file: "src/modules/publicOrder/publicOrder.repository.js",
    required: [
      "ORDER_RESPONSE_INCLUDE",
      "include: ORDER_RESPONSE_INCLUDE",
    ],
  },
];

const failures = [];

for (const check of checks) {
  if (!fs.existsSync(check.file)) {
    failures.push(`${check.file}: file is missing`);
    continue;
  }

  const source = fs.readFileSync(check.file, "utf8");

  for (const required of check.required) {
    if (!source.includes(required)) {
      failures.push(`${check.file}: missing "${required}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("Repository contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Repository contract check passed.");
