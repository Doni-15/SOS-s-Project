import fs from "node:fs";

import { transactionQuerySchema } from "../src/modules/payment/payment.validation.js";
import { getTransactions } from "../src/modules/payment/payment.service.js";

const repositoryFile = "src/modules/payment/payment.repository.js";
const serviceFile = "src/modules/payment/payment.service.js";

const repository = fs.readFileSync(repositoryFile, "utf8");
const service = fs.readFileSync(serviceFile, "utf8");

for (const text of [
  "const buildTransactionWhere =",
  "const toStartDate =",
  "const toEndDateExclusive =",
  "prisma.$transaction",
  "prisma.transaction.count",
  "items",
  "pagination",
]) {
  if (!repository.includes(text)) {
    throw new Error(`${repositoryFile} must include "${text}"`);
  }
}

for (const text of [
  "serializeTransactionResponse",
  "Array.isArray(result)",
  "Array.isArray(result?.items)",
  "items.map(serializeTransactionResponse)",
  "pagination",
]) {
  if (!service.includes(text)) {
    throw new Error(`${serviceFile} must include "${text}"`);
  }
}

const today = new Date().toISOString().slice(0, 10);

const parsed = transactionQuerySchema.parse({
  startDate: today,
  endDate: today,
  page: "1",
  limit: "8",
});

if (parsed.page !== 1 || parsed.limit !== 8) {
  throw new Error("transactionQuerySchema must coerce page and limit");
}

const result = await getTransactions(parsed);

if (!result || typeof result !== "object") {
  throw new Error("getTransactions must return object");
}

if (!Array.isArray(result.transactions)) {
  throw new Error("getTransactions.transactions must be array");
}

if (!result.pagination || typeof result.pagination !== "object") {
  throw new Error("getTransactions.pagination must be object");
}

for (const key of ["page", "limit", "total", "totalPages"]) {
  if (typeof result.pagination[key] !== "number") {
    throw new Error(`pagination.${key} must be number`);
  }
}

console.log("Transactions report check passed.");

process.exit(0);
