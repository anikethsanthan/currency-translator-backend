// const { authenticate } = require("../middleware/authenticate");
const storeTransaction = require("../controllers/currencyExchange/storeTransaction");

const transactionRouter = require("express").Router();

transactionRouter.post("/store-transaction", storeTransaction);

module.exports = transactionRouter;
