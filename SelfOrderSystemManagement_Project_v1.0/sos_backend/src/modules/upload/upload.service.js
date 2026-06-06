import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { AppError } from "../../common/errors/AppError.js";

const uploadDir = path.resolve(process.cwd(), "public", "uploads", "menu-items");

const extensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const saveMenuImage = async ({ file, baseUrl }) => {
  if (!file) {
    throw new AppError({
      statusCode: 422,
      code: "IMAGE_REQUIRED",
      message: "Image file is required",
      fields: {
        field: "image",
      },
    });
  }

  const extension = extensionByMimeType[file.mimetype];

  if (!extension) {
    throw new AppError({
      statusCode: 422,
      code: "INVALID_IMAGE_TYPE",
      message: "Only JPG, PNG, and WEBP images are allowed",
    });
  }

  await fs.mkdir(uploadDir, {
    recursive: true,
  });

  const fileName = `menu-${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, file.buffer);

  const relativePath = `/uploads/menu-items/${fileName}`;
  const imageUrl = `${baseUrl}${relativePath}`;

  return {
    imageUrl,
    relativePath,
    fileName,
    mimeType: file.mimetype,
    size: file.size,
  };
};
