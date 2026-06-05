const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const restrictTo = require("../middleware/rbac");

// ─── GET /api/ai/free-model ───────────────────────────────────
// All logged-in users can access (Free_User, Premium_User, Admin)
router.get(
  "/free-model",
  protect, // Must be logged in
  (req, res) => {
    res.status(200).json({
      success: true,
      message: `✅ Free AI Model accessed by ${req.user.email} (${req.user.role})`,
      data: { model: "GPT-Nano-Free", result: "Here is your free AI response!" },
    });
  }
);

// ─── POST /api/ai/premium-model ──────────────────────────────
// Only Premium_User and Admin can access
router.post(
  "/premium-model",
  protect,
  restrictTo("Premium_User", "Admin"), // RBAC check
  (req, res) => {
    res.status(200).json({
      success: true,
      message: `✅ Premium AI Model accessed by ${req.user.email} (${req.user.role})`,
      data: {
        model: "GPT-4-Premium",
        result: "Here is your premium AI-generated content!",
      },
    });
  }
);

// ─── DELETE /api/ai/purge-cache ───────────────────────────────
// Only Admin can access
router.delete(
  "/purge-cache",
  protect,
  restrictTo("Admin"), // Only Admin
  (req, res) => {
    res.status(200).json({
      success: true,
      message: `✅ Cache purged by Admin: ${req.user.email}`,
      data: { cacheCleared: true, timestamp: new Date().toISOString() },
    });
  }
);

module.exports = router;
