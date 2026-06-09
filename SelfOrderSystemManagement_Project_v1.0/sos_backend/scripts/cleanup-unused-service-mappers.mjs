import fs from "node:fs";

const targets = [
  {
    file: "src/modules/internalOrder/internalOrder.service.js",
    names: ["toOrderResponse", "toOrderItemResponse"],
  },
  {
    file: "src/modules/payment/payment.service.js",
    names: [
      "toTransactionResponse",
      "toReceiptResponse",
      "toReceiptPrintAttemptResponse",
      "toOrderItemResponse",
    ],
  },
];

const countNameReferences = (source, name) => {
  const matches = source.match(new RegExp(`\\b${name}\\b`, "g"));
  return matches?.length ?? 0;
};

const findDeclarationEnd = (source, start) => {
  let paren = 0;
  let brace = 0;
  let bracket = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === "\\") {
        escaped = true;
        continue;
      }

      if (ch === quote) {
        quote = null;
      }

      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "(") paren += 1;
    if (ch === ")") paren -= 1;
    if (ch === "{") brace += 1;
    if (ch === "}") brace -= 1;
    if (ch === "[") bracket += 1;
    if (ch === "]") bracket -= 1;

    if (ch === ";" && paren === 0 && brace === 0 && bracket === 0) {
      return i + 1;
    }
  }

  return -1;
};

const removeConstDeclarationIfUnused = ({ source, name }) => {
  const references = countNameReferences(source, name);

  if (references > 1) {
    return {
      source,
      removed: false,
      reason: `${name} still referenced ${references} time(s)`,
    };
  }

  const pattern = new RegExp(`(^|\\n)const\\s+${name}\\s*=`, "m");
  const match = source.match(pattern);

  if (!match || match.index === undefined) {
    return {
      source,
      removed: false,
      reason: `${name} declaration not found`,
    };
  }

  const start = match[1] === "\n" ? match.index + 1 : match.index;
  const end = findDeclarationEnd(source, start);

  if (end === -1) {
    throw new Error(`Cannot find end of declaration for ${name}`);
  }

  let removeEnd = end;

  while (source[removeEnd] === "\n") {
    removeEnd += 1;
  }

  return {
    source: source.slice(0, start) + source.slice(removeEnd),
    removed: true,
    reason: `${name} removed`,
  };
};

let totalRemoved = 0;

for (const target of targets) {
  let source = fs.readFileSync(target.file, "utf8");
  let changed = true;

  while (changed) {
    changed = false;

    for (const name of target.names) {
      const result = removeConstDeclarationIfUnused({
        source,
        name,
      });

      console.log(`${target.file}: ${result.reason}`);

      if (result.removed) {
        source = result.source;
        changed = true;
        totalRemoved += 1;
      }
    }
  }

  fs.writeFileSync(target.file, source);
}

console.log(`Cleanup complete. Removed ${totalRemoved} unused mapper declaration(s).`);
