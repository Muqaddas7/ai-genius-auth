const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: Generate Access Token ───────────────────────────
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE } // e.g. "15m"
  );
};

// ─── Helper: Generate Refresh Token ──────────────────────────
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE } // e.g. "7d"
  );
};

// ─── Register (for testing - creates new users) ──────────────
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists with this email.");
      error.statusCode = 400;
      return next(error);
    }

    // Password hashing happens automatically via pre-save hook in User model
    const user = await User.create({ email, password, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ───────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check user exists
    if (!email || !password) {
      const error = new Error("Please provide email and password.");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      return next(error);
    }

    // 2. Compare password with bcrypt hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      return next(error);
    }

    // 3. Generate both tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 4. Save refresh token to DB (whitelist approach)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 5. Send refresh token in httpOnly cookie (not accessible via JS)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,   // JS cannot read this cookie
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    // 6. Send access token in JSON response body
    res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken, // Client stores this in memory (NOT localStorage)
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ───────────────────────────────────────────
// Called automatically by client when access token expires
exports.refresh = async (req, res, next) => {
  try {
    // Read refresh token from httpOnly cookie
    const token = req.cookies.refreshToken;

    if (!token) {
      const error = new Error("No refresh token found. Please log in again.");
      error.statusCode = 401;
      return next(error);
    }

    // Verify the refresh token's signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      const error = new Error("Refresh token expired or invalid. Please log in again.");
      error.statusCode = 401;
      return next(error);
    }

    // Check token against DB whitelist (prevents reuse of stolen tokens)
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      const error = new Error("Invalid refresh token. Please log in again.");
      error.statusCode = 403;
      return next(error);
    }

    // Issue a new access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ──────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      // Remove refresh token from DB
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null }
      );
    }

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};
