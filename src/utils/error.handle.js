export const globalErrorHandler = (err, req, res, next) => {
  console.error("Global Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
