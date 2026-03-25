/**
 * Authentication middleware.
 * Validates Bearer tokens from the Authorization header.
 */

const db = require("../models/db");

/**
 * Protects a route by requiring a valid Bearer token.
 * Sets req.userId and req.user on success.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token      = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  const userId = db.sessions[token];
  if (!userId || !db.users[userId]) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }

  req.userId = userId;
  req.user   = db.users[userId];
  next();
}

module.exports = { authenticate };
