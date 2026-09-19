const jwt = require("jsonwebtoken");
require("dotenv").config();

//AUTH
exports.authMiddleware = async (req, res, next) => {
  try {
    //EXTRACT TOKEN (from cookie, body, or Authorization header)
    const token =
      req.cookies.auth_token ||
      req.header("Authorization").replace("Bearer ", "");

    //IF TOKEN MISSING - RETURN 401
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    //VERIFY THE TOKEN using JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //ATTACH DECODED PAYLOAD TO req.user
    req.user = decoded;

    //CALL next()
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validation the token",
    });
  }
};

//IS STUDENT
exports.isStudent = async (req, res, next) => {
  try {
    //GET ACCOUNT TYPE FROM req.user (set by authMiddleware)
    const accountType = req.user.accountType;

    //CHECK IF ACCOUNT TYPE IS "Student"
    //IF NOT - RETURN 401/403 (NOT AUTHORIZED)
    if (accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route.",
      });
    }

    //IF YES - CALL next()
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//IS INSTRUCTOR
exports.isInstructor = async (req, res, next) => {
  try {
    //GET ACCOUNT TYPE FROM req.user (set by authMiddleware)
    const accountType = req.user.accountType;

    //CHECK IF ACCOUNT TYPE IS "Student"
    //IF NOT - RETURN 401/403 (NOT AUTHORIZED)
    if (accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route.",
      });
    }

    //IF YES - CALL next()
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

//IS ADMIN
exports.isAdmin = async (req, res, next) => {
  try {
    //GET ACCOUNT TYPE FROM req.user (set by authMiddleware)
    const accountType = req.user.accountType;

    //CHECK IF ACCOUNT TYPE IS "Student"
    //IF NOT - RETURN 401/403 (NOT AUTHORIZED)
    if (accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route.",
      });
    }

    //IF YES - CALL next()
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
