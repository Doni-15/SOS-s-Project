import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";

import { AppError } from "../../common/errors/AppError.js";

const uploadDir = path.resolve(process.cwd(), "public", "uploads", "menu-items");

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const inspectMenuImage = async (file) => {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new AppError({
      statusCode: 422,
      code: "IMAGE_REQUIRED",
      message: "Image file is required",
      fields: {
        field: "image",
      },
    });
  }

  if (file.buffer.byteLength > MAX_IMAGE_SIZE) {
    throw new AppError({
      statusCode: 422,
      code: "IMAGE_TOO_LARGE",
      message: "Image size must not exceed 2MB",
      fields: {
        maxSizeInMb: 2,
      },
    });
  }

  let detectedType;

  try {
    detectedType = await fileTypeFromBuffer(file.buffer);
  } catch {
    detectedType = null;
  }
  const extension = allowedImageTypes.get(detectedType?.mime);

  if (!extension || detectedType?.mime !== file.mimetype) {
    throw new AppError({
      statusCode: 422,
      code: "INVALID_IMAGE_CONTENT",
      message: "Image content must match an allowed JPG, PNG, or WEBP format",
    });
  }

  return {
    extension,
    mimeType: detectedType.mime,
    size: file.buffer.byteLength,
  };
};

export const createMenuImageFileName = (extension) => {
  return `menu-${Date.now()}-${crypto.randomUUID()}${extension}`;
};

export const saveMenuImage = async ({ file, baseUrl }) => {
  const { extension, mimeType, size } = await inspectMenuImage(file);

  await fs.mkdir(uploadDir, {
    recursive: true,
    mode: 0o750,
  });

  const fileName = createMenuImageFileName(extension);
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, file.buffer, {
    flag: "wx",
    mode: 0o640,
  });

  const relativePath = `/uploads/menu-items/${fileName}`;
  const imageUrl = `${baseUrl}${relativePath}`;

  return {
    imageUrl,
    relativePath,
    fileName,
    mimeType,
    size,
  };
};
