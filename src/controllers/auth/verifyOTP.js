const Otp = require("../../models/otp");
const User = require("../../models/user");

const verifyOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    const userOtpData = await Otp.findOne({ emailId });

    if (!userOtpData) {
      return res.status(404).json({ message: "Email Id number not found" });
    }

    if (userOtpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > userOtpData.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const userData = await User.findOne({ emailId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    userData.isEmailVerified = true;
    await userData.save();

    userOtpData.otp = null;
    userOtpData.expiresAt = Date.now();
    await userOtpData.save();

    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        emailId: userData.emailId,
        isEmailVerified: userData.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyOtp;
