const bcrypt = require("bcrypt");
const OtpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
require("dotenv").config();
const mailSender = require("../utils/mailSender");

//homework: email validation

//SEND OTP HANDLER
exports.sendOTP = async (req, res) => {
  try {
    //FETCH EMAIL FROM USERS REQUEST BODY
    const { email } = req.body;

    //CHECK IF USER ALREADY EXIST
    const checkUserExist = await User.findOne({ email });
    if (checkUserExist) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    //GENERATE OTP
    let otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP is:", otp);

    //CHECK UNIQUE OTP
    let result = await OTP.findOne({ otp: otp });

    //since OTP generator does not gurantee of generating unique OTP evertime it is being called
    while (result) {
      otp = OtpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //CREATE AN ENTRY FOR OTP in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
    });
  } catch (error) {
    console.log("OTP sending failed");
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//SIGN UP HANDLER
exports.signUp = async (req, res) => {
  try {
    //DATA FETCH FROM REQUEST BODY
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;

    //VALIDATE ALL FIELDS
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //2 PASSWORDS MATCHING
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm password are not matching",
      });
    }

    //CHECK IF USER EXIST using EMAIL
    const checkUserEmail = await User.findOne({ email });
    const checkUserPhoneNo = await User.findOne({ phoneNumber });
    if (checkUserEmail || checkUserPhoneNo) {
      return res.status(401).json({
        success: false,
        message: "User already exist",
      });
    }

    //FIND MOST RECENT OTP FOR THE USER
    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    //VALIDATING OTP
    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOTP.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    // else {
    //    res.status(200).json({
    //     success: true,
    //     message: "Email is verified",
    //   });
    // }

    //HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    //CREATE ENTRY IN DB
    const profileDetails = await Profile.create({
      profileImage: `https://ui-avatars.com/api/?background=random&name=${firstName}+${lastName}`,
      dateOfBirth,
      gender,
      about,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
    });

    //SEND RESPONSE
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log("Signing Up failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//LOGIN HANDLER
exports.login = async (req, res) => {
  try {
    //GET EMAIL AND PASSWORD FROM REQ BODY
    const { email, password, role } = req.body;
    //VALIDATE DATA
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //CHECK IF USER EXISTS
    const user = await User.findOne({ email }).populate("Profile");
    //  const checkUserPhoneNo = await User.findOne({ phoneNumber });
    if (!user /*|| checkUserPhoneNo*/) {
      return res.status(404).json({
        success: false,
        message: "User does not exist with this email",
      });
    }
    //MATCH THE PASSWORD
    const userPasswordMatch = await bcrypt.compare(password, user.password);
    if (!userPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    //GENERATE JWT
    const payload = {
      userId: user._id,
      email: user.email,
      accountType: user.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    user.token = token;
    user.password = undefined;

    //CREATE COOKIE AND SEND RESPONSE
    res.cookie("auth_token", token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie (Protects from XSS)
      secure: process.env.NODE_ENV === "production", // Send cookie only over HTTPS in production
      sameSite: "strict", // Protects against Cross-Site Request Forgery (CSRF)
      maxAge: 24 * 60 * 60 * 1000, // Cookie lifetime matching JWT expiration (1 day in milliseconds)
    });

    res.status(200).json({
      success: true,
      token,
      user,
      message: "Logged In successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failure, please try again",
    });
  }
};

//CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    //GET USER DATA FROM REQ
    const userEmail = req.user.email;

    //GET OLD PASSWORD, NEW PASSWORD, CONFIRM NEW PASSWORD FROM REQ BODY
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    //VALIDATE OLD PASSWORD
    if (!oldPassword) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //Find user from DB
    const userFromDB = User.findOne({ email: userEmail });
    if (!userFromDB) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //Compare passwords and return
    const userPasswordMatch = await bcrypt.compare(
      oldPassword,
      userFromDB.password
    );
    if (!userPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    //VALIDATE AND MATCH newPassword AND confirmNewPassword
    if (!newPassword || !confirmNewPassword) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm password are not matching",
      });
    }
    //Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    //UPDATE PASSWORD IN DB
    await User.findOneAndUpdate(
      { email: userEmail },
      { password: hashedNewPassword }
    );

    // SEND MAIL - PASSWORD UPDATED
    await mailSender(
      userEmail,
      "Password Updated",
      "Your password was changed successfully."
    );

    //RETURN RESPONSE
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
