const jwt = require("jsonwebtoken");
const User = require("../models/user");
const SECRET_KEY = process.env.SECRET_KEY;
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth) {
      return res
        .status(401)
        .json({ error: "Unauthorized access, Please login to continue!" });
    }
    const token = auth.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized access, Please login to continue!" });
    }

    const decodedObj = jwt.verify(token, SECRET_KEY);

    const { id, role } = decodedObj;

    req.id = id;
    req.role = role;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Authentication failed: " + err.message });
  }
};

module.exports = { authenticate };
