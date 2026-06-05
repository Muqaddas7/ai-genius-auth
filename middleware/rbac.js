// ─── restrictTo: Authorization Middleware Factory ────────────
// Usage: restrictTo("Admin", "Premium_User")
// Returns a middleware that checks if req.user.role is allowed
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware before this runs
    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error(
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
      error.statusCode = 403; // 403 = Forbidden (authenticated but not authorized)
      return next(error);
    }
    next();
  };
};

module.exports = restrictTo;
