const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Admin", "Premium_User", "Free_User"],
      default: "Free_User",
    },
    // Store refresh tokens here (whitelist approach)
    // This lets us invalidate tokens on logout
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Pre-save Hook: Hash password before saving ──────────────
// This runs automatically before every .save() call
userSchema.pre("save", async function (next) {
  // Only hash if password was actually changed
  if (!this.isModified("password")) return next();

  // Salt rounds = 12 means bcrypt does 2^12 = 4096 hashing iterations
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Method: Compare entered password with hash ─────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
