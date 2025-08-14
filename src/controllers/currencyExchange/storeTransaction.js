const Transaction = require("../../models/transaction");
const ExchangeRate = require("../../models/exchangeRates");
const User = require("../../models/user");
const getExchangeRate = require("../../utils/getExchangeRate");

const storeTransaction = async (req, res) => {
  try {
    const userId = req.id;
    const { amount, currency, category, description } = req.body;

    // 1. Check if user is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Check exchange rate and update if older than 15 minutes
    let exchangeRate;
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Find the latest exchange rate for the given currency to INR
    const latestExchangeRate = await ExchangeRate.findOne({
      baseCurrency: currency,
      targetCurrency: "INR",
    }).sort({ updatedAt: -1 });

    // If no exchange rate exists or it's older than 15 minutes, fetch new data
    if (
      !latestExchangeRate ||
      latestExchangeRate.updatedAt < fifteenMinutesAgo
    ) {
      console.log("Fetching new exchange rate data...");
      try {
        const exchangeRateData = await getExchangeRate(currency, "INR", true);
        exchangeRate = exchangeRateData.rate;
      } catch (exchangeError) {
        console.error("Error fetching exchange rate:", exchangeError);
        // If we can't get new data but have old data, use it
        if (latestExchangeRate) {
          exchangeRate = latestExchangeRate.rate;
          console.log("Using existing exchange rate due to API error");
        } else {
          return res.status(500).json({
            success: false,
            message: "Unable to get exchange rate",
          });
        }
      }
    } else {
      // Use existing exchange rate
      exchangeRate = latestExchangeRate.rate;
      console.log("Using existing exchange rate (less than 15 minutes old)");
    }

    // 3. Calculate INR converted amount
    const INRconvertedAmount = amount * exchangeRate;

    // 4. Create and save transaction
    const newTransaction = new Transaction({
      userId,
      amount,
      currency: currency.toUpperCase(),
      INRconvertedAmount,
      category,
      description: description || "",
    });

    const savedTransaction = await newTransaction.save();

    return res.status(201).json({
      success: true,
      message: "Transaction stored successfully",
      data: {
        transaction: savedTransaction,
        exchangeRate: exchangeRate,
        INRconvertedAmount: INRconvertedAmount,
      },
    });
  } catch (error) {
    console.error("Error in storeTransaction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = storeTransaction;
