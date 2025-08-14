const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },
    expiresAt: {
      type: Date,
      index: { expires: "3m" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Otp", otpSchema);
