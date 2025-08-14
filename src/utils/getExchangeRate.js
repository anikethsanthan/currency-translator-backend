const ExchangeRate = require("../models/exchangeRates");

async function getExchangeRate(
  baseCurrency = "USD",
  targetCurrency = "INR",
  saveToDb = true
) {
  try {
    // Using exchangerate-api.com (free API with no key required)
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the target currency rate exists
    if (!data.rates || !data.rates[targetCurrency]) {
      throw new Error(`Exchange rate for ${targetCurrency} not found`);
    }

    const exchangeRateData = {
      base: data.base,
      date: data.date,
      rate: data.rates[targetCurrency],
      targetCurrency: targetCurrency,
    };

    // Console log the exchange rate data
    console.log("Exchange Rate Data:", data);
    console.log(
      `${baseCurrency} to ${targetCurrency}:`,
      data.rates[targetCurrency]
    );
    console.log(`Date: ${data.date}`);

    // Save to database if requested
    if (saveToDb) {
      try {
        const exchangeRateDoc = new ExchangeRate({
          baseCurrency: data.base,
          targetCurrency: targetCurrency,
          rate: data.rates[targetCurrency],
        });

        await exchangeRateDoc.save();
        console.log("✅ Exchange rate saved to database");
      } catch (dbError) {
        // If it's a duplicate key error (rate already exists for this date), just log it
        if (dbError.code === 11000) {
          console.log(
            "ℹ️  Exchange rate already exists in database for this date"
          );
        } else {
          console.error("❌ Error saving to database:", dbError.message);
          // Don't throw here, we still want to return the rate even if DB save fails
        }
      }
    }

    return exchangeRateData;
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    throw error;
  }
}

/**
 * Alternative function using exchangerate.host API (requires API key for production)
 * @param {string} baseCurrency - Base currency code (default: USD)
 * @param {string} targetCurrency - Target currency code (default: INR)
 * @param {string} apiKey - API key for exchangerate.host (optional for limited free usage)
 * @returns {Promise<Object>} Exchange rate data
 */
async function getExchangeRateWithHost(
  baseCurrency = "USD",
  targetCurrency = "INR",
  apiKey = null
) {
  try {
    let url = `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${targetCurrency}`;

    // Add API key if provided
    if (apiKey) {
      url += `&access_key=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (!data.success) {
      throw new Error(`API Error: ${data.error?.info || "Unknown error"}`);
    }

    // Console log the exchange rate data
    console.log("Exchange Rate Data:", data);
    console.log(
      `${baseCurrency} to ${targetCurrency}:`,
      data.rates[targetCurrency]
    );
    console.log(`Date: ${data.date}`);

    return {
      base: data.base,
      date: data.date,
      rate: data.rates[targetCurrency],
      targetCurrency: targetCurrency,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    throw error;
  }
}

/**
 * Get exchange rate from database by date
 * @param {string} baseCurrency - Base currency code
 * @param {string} targetCurrency - Target currency code
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Exchange rate data or null if not found
 */
async function getExchangeRateFromDb(
  baseCurrency = "USD",
  targetCurrency = "INR",
  date = null
) {
  try {
    const query = { baseCurrency, targetCurrency };

    if (date) {
      query.date = date;
    }

    const exchangeRate = await ExchangeRate.findOne(query).sort({
      fetchedAt: -1,
    });

    if (exchangeRate) {
      console.log(
        `📊 Found exchange rate in database: ${baseCurrency} to ${targetCurrency} = ${exchangeRate.rate} (${exchangeRate.date})`
      );
      return {
        base: exchangeRate.baseCurrency,
        targetCurrency: exchangeRate.targetCurrency,
        rate: exchangeRate.rate,
        date: exchangeRate.date,
        fetchedAt: exchangeRate.fetchedAt,
      };
    }

    console.log(
      `📊 No exchange rate found in database for ${baseCurrency} to ${targetCurrency}`
    );
    return null;
  } catch (error) {
    console.error("Error fetching exchange rate from database:", error.message);
    throw error;
  }
}

/**
 * Get all exchange rates for a specific currency pair
 * @param {string} baseCurrency - Base currency code
 * @param {string} targetCurrency - Target currency code
 * @param {number} limit - Number of records to return (default: 10)
 * @returns {Promise<Array>} Array of exchange rate records
 */
async function getExchangeRateHistory(
  baseCurrency = "USD",
  targetCurrency = "INR",
  limit = 10
) {
  try {
    const exchangeRates = await ExchangeRate.find({
      baseCurrency,
      targetCurrency,
    })
      .sort({ date: -1, fetchedAt: -1 })
      .limit(limit);

    console.log(
      `📈 Found ${exchangeRates.length} historical exchange rates for ${baseCurrency} to ${targetCurrency}`
    );
    return exchangeRates;
  } catch (error) {
    console.error("Error fetching exchange rate history:", error.message);
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  getExchangeRate,
  getExchangeRateWithHost,
  getExchangeRateFromDb,
  getExchangeRateHistory,
};
