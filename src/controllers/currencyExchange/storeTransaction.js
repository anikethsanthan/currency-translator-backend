const Transaction = require("../../models/transaction");
const ExchangeRate = require("../../models/exchangeRates");

const storeTransaction = async (req, res) => {
  try {
    const userId = req.id;
    const { amount, currency, category, description } = req.body;
  } catch (error) {
    console.error("Error in storeTransaction:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = storeTransaction;
