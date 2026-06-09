import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const modulesDir = path.join(rootDir, "src/modules");

const forbiddenLocalMappers = [
  "toOrderResponse",
  "toTransactionResponse",
  "toReceiptResponse",
  "toReceiptPrintAttemptResponse",
];

const walk = async (dir) => {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".service.js")) continue;

    files.push(fullPath);
  }

  return files;
};

const files = await walk(modulesDir);
const failures = [];

for (const file of files) {
  const source = await fs.readFile(file, "utf8");
  const relative = path.relative(rootDir, file);

  for (const mapper of forbiddenLocalMappers) {
    const pattern = new RegExp(`^\\s*const\\s+${mapper}\\s*=`, "m");

    if (pattern.test(source)) {
      failures.push(`${relative}: local ${mapper} is forbidden; use common serializers instead`);
    }
  }
}

if (failures.length > 0) {
  console.error("Service mapper check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Service mapper check passed.");
