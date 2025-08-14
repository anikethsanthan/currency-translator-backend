const signup = require("../controllers/auth/signup");
const verifyOtp = require("../controllers/auth/verifyOTP");
const login = require("../controllers/auth/login");
const registerEmail = require("../controllers/auth/registerEmail");
const resetPassword = require("../controllers/auth/resetPassword");

// const { authenticate } = require("../middleware/authenticate");

const userRouter = require("express").Router();

userRouter.post("/signup", signup);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/login", login);
userRouter.post("/register-email", registerEmail);
userRouter.post("/reset-password", resetPassword);

module.exports = userRouter;
