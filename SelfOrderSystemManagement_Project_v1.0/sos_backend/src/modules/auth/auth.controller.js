import { successResponse } from "../../common/responses/apiResponse.js";
import { loginSchema } from "./auth.validation.js";
import { login, logout } from "./auth.service.js";

export const loginController = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);

    const result = await login({
      username: payload.username,
      password: payload.password,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return successResponse(res, {
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const meController = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: "Authenticated user retrieved successfully",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    await logout({
      accessToken: req.accessToken,
      user: req.user,
    });

    return successResponse(res, {
      message: "Logout successful",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
