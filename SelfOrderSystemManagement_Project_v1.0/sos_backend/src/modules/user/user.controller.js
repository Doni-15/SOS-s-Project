import { successResponse } from "../../common/responses/apiResponse.js";
import {
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  userParamSchema,
  userQuerySchema,
} from "./user.validation.js";
import {
  activateUser,
  createUser,
  deactivateUser,
  getUserById,
  getUsers,
  resetUserPassword,
  updateUser,
} from "./user.service.js";

export const getUsersController = async (req, res, next) => {
  try {
    const query = userQuerySchema.parse(req.query);
    const users = await getUsers(query);

    return successResponse(res, {
      message: "Users retrieved successfully",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetailController = async (req, res, next) => {
  try {
    const params = userParamSchema.parse(req.params);
    const user = await getUserById(params.id);

    return successResponse(res, {
      message: "User retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUserController = async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);

    const user = await createUser({
      payload,
      actor: req.user,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const params = userParamSchema.parse(req.params);
    const payload = updateUserSchema.parse(req.body);

    const user = await updateUser({
      id: params.id,
      payload,
      actor: req.user,
    });

    return successResponse(res, {
      message: "User updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPasswordController = async (req, res, next) => {
  try {
    const params = userParamSchema.parse(req.params);
    const payload = resetUserPasswordSchema.parse(req.body);

    const user = await resetUserPassword({
      id: params.id,
      payload,
      actor: req.user,
    });

    return successResponse(res, {
      message: "User password reset successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const activateUserController = async (req, res, next) => {
  try {
    const params = userParamSchema.parse(req.params);

    const user = await activateUser({
      id: params.id,
      actor: req.user,
    });

    return successResponse(res, {
      message: "User activated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUserController = async (req, res, next) => {
  try {
    const params = userParamSchema.parse(req.params);

    const user = await deactivateUser({
      id: params.id,
      actor: req.user,
    });

    return successResponse(res, {
      message: "User deactivated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
