const User = require("../models/User");
const OTP = require("../models/OTP");
const OtpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");

//homework: email validation

//SEND OTP HANDLER
exports.sendOTP = async (res, req) => {
  try {
    //FETCH EMAIL FROM USERS REQUEST BODY
    const { email } = req.body;

    //CHECK IF USER ALREADY EXIST
    const checkUserExist = await User.findOne({ email });
    if (checkUserExist) {
      return res.status(401).json({
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
    let result = OTP.findOne({ otp: otp });

    //since OTP generator does not gurantee of generating unique OTP evertime it is being called
    while (result) {
      otp = OtpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    //CREATE AN ENTRY FOR OTP in DB
    const otpBody = OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otp,
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
      otp
    } = req.body;

    //VALIDATE ALL FIELDS
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword || !otp) {
      res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //2 PASSWORDS MATCHING
    if (
      password.toString().toLowerCase() !==
      confirmPassword.toString().toLowerCase()
    ) {
      res.status(401).json({
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
    const recentOTP = await OTP.find({ email }).sort({createdAt: -1}).limit(1);
    
    //VALIDATING OTP
    if (recentOTP.length === 0) {
      res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }else if (otp !== recentOTP.otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }else{
      res.status(200).json({
        success: false,
        message: "Email is verified"
      });
    }

    //HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    //CREATE ENTRY IN DB
    const profileDetails = await Profile.create({
      profileImage: `https://ui-avatars.com/api/?background=random&name=${firstName}+${lastName}`,
      dateOfBirth,
      gender,
      about
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      hashedPassword,
      accountType,
      additionalDetails: profileDetails._id
    });
    
    //SEND RESPONSE
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user
    })

  } catch (error) {}
};
//LOGIN HANDLER
