export const successResponse = (
  res,
  { statusCode = 200, message = "OK", data = null } = {}
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (
  res,
  {
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    message = "Internal server error",
    fields = null,
    path = null,
  } = {}
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      fields,
    },
    timestamp: new Date().toISOString(),
    path,
  });
};
