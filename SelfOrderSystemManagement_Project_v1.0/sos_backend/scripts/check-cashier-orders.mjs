import fs from "node:fs";

import { orderQuerySchema } from "../src/modules/internalOrder/internalOrder.validation.js";
import { getInternalOrders } from "../src/modules/internalOrder/internalOrder.service.js";

const repositoryFile = "src/modules/internalOrder/internalOrder.repository.js";
const serviceFile = "src/modules/internalOrder/internalOrder.service.js";

const repository = fs.readFileSync(repositoryFile, "utf8");
const service = fs.readFileSync(serviceFile, "utf8");

const submittedQuery = orderQuerySchema.parse({
  status: "SUBMITTED",
  page: "1",
  limit: "100",
});

if (
  submittedQuery.status !== "SUBMITTED" ||
  submittedQuery.page !== 1 ||
  submittedQuery.limit !== 100
) {
  throw new Error("orderQuerySchema must parse cashier list query");
}

const defaultQuery = orderQuerySchema.parse({});

if (defaultQuery.page !== 1 || typeof defaultQuery.limit !== "number") {
  throw new Error("orderQuerySchema must provide page/limit defaults");
}

for (const text of [
  "ORDER_LIST_INCLUDE",
  "include: ORDER_LIST_INCLUDE",
  "export const findOrders = async",
  "safeLimit",
  "skip",
  "take: safeLimit",
]) {
  if (!repository.includes(text)) {
    throw new Error(`${repositoryFile} must include "${text}"`);
  }
}

for (const text of [
  "../../common/serializers/order.serializer.js",
  "serializeOrderResponse",
  "export const getInternalOrders = async",
  "Array.isArray(result)",
  "orders.map(serializeOrderResponse)",
]) {
  if (!service.includes(text)) {
    throw new Error(`${serviceFile} must include "${text}"`);
  }
}

const orders = await getInternalOrders(submittedQuery);

if (!Array.isArray(orders)) {
  throw new Error("getInternalOrders must return an array");
}

console.log("Cashier orders check passed.");

process.exit(0);
