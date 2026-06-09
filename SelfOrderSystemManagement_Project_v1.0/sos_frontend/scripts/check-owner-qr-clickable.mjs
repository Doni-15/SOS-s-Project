import fs from "node:fs";

const file = "src/features/owner/pages/OwnerTablesPage.jsx";
const source = fs.readFileSync(file, "utf8");

const failures = [];

const mustInclude = [
  "function QrStatusBadge({ token, onClick, isSelected = false })",
  "onClick={(event) =>",
  "event.stopPropagation();",
  "title=\"Klik untuk melihat QR meja\"",
  "const handleViewTableQr =",
  "setSelectedTableId(table.id)",
  "setGeneratedQrToken(null)",
  "onClick={() => handleViewTableQr(table)}",
  "isSelected={selectedTable?.id === table.id}",
];

for (const text of mustInclude) {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"`);
  }
}

if (/function QrStatusBadge\(\{ token \}\)/.test(source)) {
  failures.push(`${file}: QrStatusBadge is still static/non-clickable`);
}

if (failures.length > 0) {
  console.error("Owner QR clickable check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Owner QR clickable check passed.");
