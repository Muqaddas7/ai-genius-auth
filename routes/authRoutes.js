const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");

// POST /api/auth/register  — Create test users
router.post("/register", register);

// POST /api/auth/login     — Returns accessToken + sets refreshToken cookie
router.post("/login", login);

// POST /api/auth/refresh   — Uses cookie to issue new access token
router.post("/refresh", refresh);

// POST /api/auth/logout    — Clears refresh token
router.post("/logout", logout);

module.exports = router;
