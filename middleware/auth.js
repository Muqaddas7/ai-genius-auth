const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── protect middleware ───────────────────────────────────────
// Reads Authorization: Bearer <token> header
// Verifies the token signature with JWT_SECRET
// Attaches decoded user payload to req.user
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("No token provided. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Verify token — throws error if expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object for downstream use
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    // jwt.verify throws "TokenExpiredError" or "JsonWebTokenError"
    if (err.name === "TokenExpiredError") {
      const error = new Error("Access token expired. Please refresh.");
      error.statusCode = 401;
      return next(error);
    }
    const error = new Error("Invalid token. Unauthorized.");
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = protect;
