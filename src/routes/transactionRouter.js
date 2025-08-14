const { authenticate } = require("../middleware/authenticate");
const storeTransaction = require("../controllers/currencyExchange/storeTransaction");
const getTransaction = require("../controllers/currencyExchange/getTransaction");

const transactionRouter = require("express").Router();

transactionRouter.post("/store-transaction", authenticate, storeTransaction);
transactionRouter.get("/get-transaction", authenticate, getTransaction);

module.exports = transactionRouter;
