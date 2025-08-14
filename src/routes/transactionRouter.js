const { authenticate } = require("../middleware/authenticate");
const storeTransaction = require("../controllers/currencyExchange/storeTransaction");

const transactionRouter = require("express").Router();

transactionRouter.post("/store-transaction", authenticate, storeTransaction);

module.exports = transactionRouter;
