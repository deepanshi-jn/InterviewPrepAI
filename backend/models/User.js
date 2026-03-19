const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String },
    twoFactorSecret: { type: String }, // Stores the secret key for 2FA
    twoFactorEnabled: { type: Boolean, default: false }, // Indicates if 2FA is active
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
