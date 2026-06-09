import fs from "node:fs";

const file = "scripts/seed-default-menu.mjs";
const source = fs.readFileSync(file, "utf8");

const failures = [];

const mustInclude = [
  "defaultCategories",
  "defaultMenuItems",
  "Makanan",
  "Minuman",
  "Cemilan",
  "Paket Hemat",
  "Nasi Goreng Spesial",
  "Ayam Geprek",
  "Es Teh Manis",
  "Paket Ayam Geprek + Es Teh",
  "prisma.menuCategory.upsert",
  "prisma.menuItem.findFirst",
  "prisma.menuItem.update",
  "prisma.menuItem.create",
  "availabilityStatus: \"AVAILABLE\"",
  "isActive: true",
];

for (const text of mustInclude) {
  if (!source.includes(text)) {
    failures.push(`${file}: missing "${text}"`);
  }
}

if (failures.length > 0) {
  console.error("Default menu seed check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Default menu seed check passed.");
