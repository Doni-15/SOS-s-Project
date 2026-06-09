import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");

const ignoredFiles = new Set([
  path.join(srcDir, "server.js"),
]);

const ignoredDirs = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
]);

const walk = async (dir) => {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".js")) continue;
    if (ignoredFiles.has(fullPath)) continue;

    files.push(fullPath);
  }

  return files;
};

const files = (await walk(srcDir)).sort();

const failures = [];

for (const file of files) {
  const relative = path.relative(rootDir, file);

  try {
    await import(pathToFileURL(file).href);
    console.log(`OK ${relative}`);
  } catch (error) {
    failures.push({
      file: relative,
      error,
    });

    console.error(`FAIL ${relative}`);
    console.error(error?.stack ?? error);
  }
}

if (failures.length > 0) {
  console.error("");
  console.error(`Import smoke check failed: ${failures.length} file(s) failed.`);
  process.exit(1);
}

console.log("");
console.log(`Import smoke check passed: ${files.length} file(s) imported.`);
