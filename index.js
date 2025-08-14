const express = require("express");
require("dotenv").config();
const { connectDb } = require("./src/config/database");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const router = require("./src/routes");

const app = express();
const PORT = 7777;
app.use(cors());
app.use(express.json());
app.use(cookieparser());
app.use("/movie-finder", router);

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.log(" unsuccessfull connection with the database");
  });
