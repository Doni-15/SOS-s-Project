import fs from "node:fs";

const patchImport = ({ file, importLine, after }) => {
  let source = fs.readFileSync(file, "utf8");

  if (!source.includes(importLine)) {
    if (!source.includes(after)) {
      throw new Error(`Import anchor not found in ${file}: ${after}`);
    }

    source = source.replace(after, `${after}\n${importLine}`);
    fs.writeFileSync(file, source);
    console.log(`Added import in ${file}`);
  }
};

const replaceCallsOutsideDeclaration = ({ file, localName, importedName }) => {
  const lines = fs.readFileSync(file, "utf8").split("\n");

  const output = lines.map((line) => {
    const declarationPattern = new RegExp(`^\\s*const\\s+${localName}\\s*=`);
    if (declarationPattern.test(line)) return line;

    return line.replaceAll(`${localName}(`, `${importedName}(`);
  });

  fs.writeFileSync(file, output.join("\n"));
  console.log(`Replaced calls ${localName}( -> ${importedName}( in ${file}`);
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

const removeConstDeclaration = ({ file, name }) => {
  let source = fs.readFileSync(file, "utf8");

  const pattern = new RegExp(`(^|\\n)const\\s+${name}\\s*=`, "m");
  const match = source.match(pattern);

  if (!match || match.index === undefined) {
    console.log(`SKIP ${file}: ${name} declaration not found`);
    return;
  }

  const start = match[1] === "\n" ? match.index + 1 : match.index;
  const end = findDeclarationEnd(source, start);

  if (end === -1) {
    throw new Error(`Cannot find declaration end for ${name} in ${file}`);
  }

  let removeEnd = end;
  while (source[removeEnd] === "\n") removeEnd += 1;

  source = source.slice(0, start) + source.slice(removeEnd);
  fs.writeFileSync(file, source);

  console.log(`Removed ${name} from ${file}`);
};

patchImport({
  file: "src/modules/publicOrder/publicOrder.service.js",
  importLine:
    'import { toOrderResponse as serializeOrderResponse } from "../../common/serializers/order.serializer.js";',
  after: 'import { AppError } from "../../common/errors/AppError.js";',
});

replaceCallsOutsideDeclaration({
  file: "src/modules/publicOrder/publicOrder.service.js",
  localName: "toOrderResponse",
  importedName: "serializeOrderResponse",
});

const removals = [
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
  {
    file: "src/modules/publicOrder/publicOrder.service.js",
    names: ["toOrderResponse"],
  },
];

for (const target of removals) {
  for (const name of target.names) {
    removeConstDeclaration({
      file: target.file,
      name,
    });
  }
}

console.log("Serializer cleanup applied.");
