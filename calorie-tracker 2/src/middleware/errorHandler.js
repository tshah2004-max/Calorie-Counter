/**
 * Global error handling middleware.
 * Must be registered last in app.js (after all routes).
 */

const config = require("../config/env");

// 404 handler — catches any unmatched routes
function notFound(req, res) {
  res.status(404).json({
    error:  "Route not found.",
    path:   req.originalUrl,
    method: req.method,
  });
}

// Generic error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message    = config.isDev ? err.message : "An unexpected error occurred.";

  res.status(statusCode).json({ error: message });
}

module.exports = { notFound, errorHandler };
