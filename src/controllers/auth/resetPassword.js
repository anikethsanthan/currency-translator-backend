const Otp = require("../../models/otp");
const User = require("../../models/user");
const bcrypt = require("bcrypt");

const resetPassword = async (req, res) => {
  try {
    const { emailId, otp, newPassword } = req.body;

    const userOtpData = await Otp.findOne({ emailId });

    if (!userOtpData) {
      return res.status(404).json({ message: "Email Id not found" });
    }

    if (userOtpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > userOtpData.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    userOtpData.otp = null;
    userOtpData.expiresAt = Date.now();
    await userOtpData.save();

    const userData = await User.findOne({ emailId });
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    userData.password = hashedPassword;
    await userData.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = resetPassword;
