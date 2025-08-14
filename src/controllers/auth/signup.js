const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SAFE_DATA = [
  "_id",
  "firstName",
  "lastName",
  "emailId",
  "role",
  "isEmailVerified",
];

const SECRET_KEY = process.env.SECRET_KEY;

const signup = async (req, res) => {
  try {
    const { firstName, lastName, password, emailId } = req.body;

    const role = "user";

    if (!firstName || !lastName || !password || !emailId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ emailId });
    if (!existingUser) {
      return res.status(400).json({ message: "Verify your email first" });
    }
    if (existingUser.isEmailVerified === false) {
      return res.status(400).json({ message: "Email not verified" });
    }
    if (existingUser.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.password = hashedPassword;
    existingUser.role = role;

    await existingUser.save();

    const token = jwt.sign(
      {
        id: existingUser._id,
        emailId: existingUser.emailId,
        role: existingUser.role,
      },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    const safeUserData = {};
    SAFE_DATA.forEach((field) => {
      if (existingUser[field] !== undefined) {
        safeUserData[field] = existingUser[field];
      }
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: safeUserData,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = signup;
