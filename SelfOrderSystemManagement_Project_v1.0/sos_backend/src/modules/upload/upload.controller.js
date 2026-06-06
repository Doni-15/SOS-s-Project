import { successResponse } from "../../common/responses/apiResponse.js";
import { saveMenuImage } from "./upload.service.js";

export const uploadMenuImageController = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const image = await saveMenuImage({
      file: req.file,
      baseUrl,
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
