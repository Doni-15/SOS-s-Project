export class AppError extends Error {
  constructor({
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    message = "Internal server error",
    fields = null,
  }) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    this.isOperational = true;
  }
}
