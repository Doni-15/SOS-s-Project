import fs from "node:fs";

const failures = [];

const repositoryFile = "src/modules/table/table.repository.js";
const serviceFile = "src/modules/table/table.service.js";

const repository = fs.readFileSync(repositoryFile, "utf8");
const service = fs.readFileSync(serviceFile, "utf8");

const tokenValueSelectCount = (repository.match(/tokenValue:\s*true/g) ?? []).length;

if (tokenValueSelectCount < 3) {
  failures.push(
    `${repositoryFile}: tokenValue must be selected for QR token list, table active token, and table detail token`,
  );
}

if (!service.includes("token: qrToken.tokenValue ?? undefined")) {
  failures.push(`${serviceFile}: QR token response must expose token from tokenValue`);
}

if (!service.includes("activeQrToken")) {
  failures.push(`${serviceFile}: table response must include activeQrToken metadata`);
}

if (failures.length > 0) {
  console.error("QR token contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("QR token contract check passed.");
