const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 1,
    },
    lastName: {
      type: String,
      minlength: 1,
    },
    emailId: {
      type: String,
      minlength: 4,
      maxlength: 150,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter a valid email address!");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlenght: 8,
      maxlength: 120,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password!");
        }
      },
    },
    role: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
