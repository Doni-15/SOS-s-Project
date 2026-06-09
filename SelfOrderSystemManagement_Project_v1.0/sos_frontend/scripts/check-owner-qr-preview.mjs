import fs from "node:fs";

const file = "src/features/owner/pages/OwnerTablesPage.jsx";
const source = fs.readFileSync(file, "utf8");

const failures = [];

const mustInclude = [
  "function normalizeQrTokenList(",
  "function getRawQrTokenValue(",
  "const resolvedActiveQrToken =",
  "selectedTable?.activeQrToken",
  "selectedTable?.recentQrTokens",
  "normalizeQrTokenList(qrTokensQuery.data)",
  "generatedQrToken ?? resolvedActiveQrToken",
  "const previewRawToken = getRawQrTokenValue(previewQrToken)",
  "previewRawToken ? getCustomerOrderUrl(previewRawToken) :",
  "QRCodeCanvas",
];

for (const text of mustInclude) {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"`);
  }
}

if (source.includes("generatedQrToken ?? activeQrToken")) {
  failures.push(`${file}: preview still references undefined activeQrToken`);
}

if (/const qrUrl = generatedQrToken\?\.token\s*\? getCustomerOrderUrl\(generatedQrToken\.token\)\s*: ""/.test(source)) {
  failures.push(`${file}: qrUrl still depends only on generatedQrToken.token`);
}

if (failures.length > 0) {
  console.error("Owner QR preview check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Owner QR preview check passed.");
