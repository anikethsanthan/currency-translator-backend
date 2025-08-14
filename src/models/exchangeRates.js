const mongoose = require("mongoose");

const exchangeRateSchema = new mongoose.Schema(
  {
    baseCurrency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD",
    },
    targetCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);

module.exports = ExchangeRate;
