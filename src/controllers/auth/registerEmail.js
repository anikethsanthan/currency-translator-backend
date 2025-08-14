const User = require("../../models/user");
const Otp = require("../../models/otp");
const generateOTP = require("../../utils/generateotp");
const sendMail = require("../../utils/sendMail");

const registerEmail = async (req, res) => {
  try {
    const { emailId, forgotPassMail } = req.body;

    if (!emailId || !/\S+@\S+\.\S+/.test(emailId)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const existingUser = await User.find({ emailId });
    if (existingUser.length === 0) {
      const newUser = new User({
        emailId,
        role: "user",
      });
      await newUser.save();
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3);

    let emailEntry = await Otp.findOne({ emailId });

    if (emailEntry) {
      emailEntry.otp = otp;
      emailEntry.expiresAt = expiresAt;
      await emailEntry.save();
    } else {
      await Otp.create({ emailId, otp, expiresAt });
    }

    if (forgotPassMail) {
      await sendMail(
        emailId,
        "Password Reset Request - Bunny Bloom",
        `Hello,\n\nWe received a request to reset your password. If you did not make this request, please ignore this email.\n\nYour OTP for password reset is: ${otp}\n\nThis OTP will expire in 3 minutes.\n\nBest regards,\nBunny Bloom Team`
      );
    } else {
      await sendMail(
        emailId,
        "Email Verification - Bunny Bloom",
        `Hello,\n\nWelcome to Bunny Bloom! Please verify your email address to complete your registration.\n\nYour verification OTP is: ${otp}\n\nThis OTP will expire in 3 minutes.\n\nBest regards,\nBunny Bloom Team`
      );
    }

    return res.status(201).json({ message: "OTP sent successfully", emailId });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = registerEmail;
