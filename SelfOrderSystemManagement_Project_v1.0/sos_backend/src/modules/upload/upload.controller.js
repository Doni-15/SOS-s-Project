import { successResponse } from "../../common/responses/apiResponse.js";
import { env } from "../../config/env.js";
import { saveMenuImage } from "./upload.service.js";

export const uploadMenuImageController = async (req, res, next) => {
  try {
    const image = await saveMenuImage({
      file: req.file,
      baseUrl: env.publicBaseUrl,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Menu image uploaded successfully",
      data: {
        image,
      },
    });
  } catch (error) {
    next(error);
  }
};
