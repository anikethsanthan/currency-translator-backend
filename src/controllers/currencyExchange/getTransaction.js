const Transaction = require("../../models/transaction");
const mongoose = require("mongoose");

const getTransaction = async (req, res) => {
  try {
    const userId = "689da173eba6cd90af55ca5c";
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Validate category if provided
    const validCategories = ["food", "travel", "utilities", "others"];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category. Valid categories are: food, travel, utilities, others",
      });
    }

    // Get current month start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Build query object
    const baseQuery = { userId: new mongoose.Types.ObjectId(userId) };
    if (category) {
      baseQuery.category = category;
    }

    // Get paginated transactions
    const transactions = await Transaction.find(baseQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of transactions for pagination
    const totalTransactions = await Transaction.countDocuments(baseQuery);

    // Get total transactions for current month (with category filter if provided)
    const currentMonthQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    };
    if (category) {
      currentMonthQuery.category = category;
    }

    const currentMonthTransactions = await Transaction.countDocuments(
      currentMonthQuery
    );

    const currentMonthExpenseResult = await Transaction.aggregate([
      {
        $match: currentMonthQuery,
      },
      {
        $group: {
          _id: null,
          totalExpenseINR: { $sum: "$INRconvertedAmount" },
        },
      },
    ]);

    const currentMonthTotalExpenseINR =
      currentMonthExpenseResult.length > 0
        ? currentMonthExpenseResult[0].totalExpenseINR
        : 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalTransactions / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        currentMonthTransactions,
        currentMonthTotalExpenseINR,
        filters: {
          category: category || "all",
        },
      },
      message: category
        ? `Transactions for category '${category}' retrieved successfully`
        : "Transactions retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getTransaction:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = getTransaction;
