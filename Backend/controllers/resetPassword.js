const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//Reset Password token
exports.resetPasswordToken = async (req, res) => {
  try {
    //Get email
    const { email } = req.body;

    //validate email
    if (!email) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist with this email",
      });
    }

    //generate token
    const token = crypto.randomUUID();

    //update the token in DB of User
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //create URL
    const URL = `http://localhost:3000/update-password/${token}`;

    //send mail to user
    mailSender(
      email,
      "Password Reset Link",
      `Password reset link: ${url}. This link is valid for 5 minutes. If you did not request this, please ignore.`
    );

    // RETURN RESPONSE
    return res.status(200).json({
      success: true,
      message: "Email sent successfully, please check email to reset password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending reset password",
    });
  }
};

//Reset Password
exports.resetPassword = async (req, res) => {
  try {
    //fetch data
    const { token, newPassword, confirmPassword } = req.body;

    //get user details through token
    const userDetails = User.findOne({ token: token });
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //token validation
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Token is expired, please regenerate your link",
      });
    }
    //validate data
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm password are not matching",
      });
    }
    //hash password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    //update user password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedNewPassword },
      { new: true }
    );

    // SEND MAIL - PASSWORD UPDATED
    await mailSender(
      userDetails.email,
      "Password Updated",
      "Your password was changed successfully."
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing password",
    });
  }
};
