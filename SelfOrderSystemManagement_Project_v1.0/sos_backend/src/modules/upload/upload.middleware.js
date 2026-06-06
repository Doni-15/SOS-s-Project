import multer from "multer";

import { AppError } from "../../common/errors/AppError.js";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new AppError({
          statusCode: 422,
          code: "INVALID_IMAGE_TYPE",
          message: "Only JPG, PNG, and WEBP images are allowed",
          fields: {
            allowedTypes: ["image/jpeg", "image/png", "image/webp"],
            receivedType: file.mimetype,
          },
        })
      );
    }

    return callback(null, true);
  },
});

export const menuImageUploadMiddleware = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError({
            statusCode: 422,
            code: "IMAGE_TOO_LARGE",
            message: "Image size must not exceed 2MB",
            fields: {
              maxSizeInMb: 2,
            },
          })
        );
      }

      return next(
        new AppError({
          statusCode: 422,
          code: "IMAGE_UPLOAD_ERROR",
          message: error.message,
        })
      );
    }

    return next(error);
  });
};
