import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const failures = [];

const ignoredDirs = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".vite",
  ".stabilize-backups",
]);

const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

const toProjectPath = (file) => path.relative(ROOT, file).replaceAll(path.sep, "/");

const importPatterns = [
  /import\s+[^'"]*?from\s+["']([^"']+)["']/g,
  /export\s+[^'"]*?from\s+["']([^"']+)["']/g,
  /import\s*\(\s*["']([^"']+)["']\s*\)/g,
];

const isRelativeImport = (specifier) =>
  specifier.startsWith("./") || specifier.startsWith("../");

const hasSuspiciousSegment = (specifier) => {
  return (
    specifier.includes("././") ||
    specifier.includes("/./") ||
    specifier.includes("//") ||
    specifier.includes(".bak") ||
    specifier.includes(".backup") ||
    specifier.includes("dist/") ||
    specifier.includes("build/")
  );
};

const fileExistsWithKnownExtension = (basePath) => {
  if (fs.existsSync(basePath)) return true;

  for (const ext of [".js", ".jsx", ".ts", ".tsx", ".json"]) {
    if (fs.existsSync(`${basePath}${ext}`)) return true;
  }

  for (const ext of [".js", ".jsx", ".ts", ".tsx"]) {
    if (fs.existsSync(path.join(basePath, `index${ext}`))) return true;
  }

  return false;
};

for (const file of walk(SRC_DIR)) {
  const source = fs.readFileSync(file, "utf8");
  const projectPath = toProjectPath(file);

  for (const pattern of importPatterns) {
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(source)) !== null) {
      const specifier = match[1];

      if (hasSuspiciousSegment(specifier)) {
        failures.push(
          `${projectPath}: suspicious import path "${specifier}"`,
        );
      }

      if (!isRelativeImport(specifier)) {
        continue;
      }

      const resolvedBase = path.resolve(path.dirname(file), specifier);

      if (!resolvedBase.startsWith(SRC_DIR)) {
        failures.push(
          `${projectPath}: relative import escapes src directory "${specifier}"`,
        );
        continue;
      }

      if (!fileExistsWithKnownExtension(resolvedBase)) {
        failures.push(
          `${projectPath}: unresolved relative import "${specifier}"`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Frontend import hygiene check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Frontend import hygiene check passed.");
