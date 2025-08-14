const mongoose = require("mongoose");

const transaction = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    INRconvertedAmount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["food", "travel", "utilities", "others"],
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transaction);
