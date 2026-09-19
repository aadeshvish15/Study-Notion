const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    //fetch userid and data
    const { dateOfBirth, gender, about } = req.body;
    const userID = req.user._id;
    //validate
    if (!dateOfBirth || !gender || !about || !userID) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //find user profile
    const userDetails = await User.findById(userID);
    const profileID = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileID);

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.gender = gender;
    profileDetails.about = about;
    await profileDetails.save();

    //return
    return res.status(200).json({
      success: true,
      message: "profile details updated successfully",
      profileDetails,
    });
  } catch (error) {
    console.log("profile details updation failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    const userID = req.user._id;
    //validate
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "User with this ID doesn't exist",
      });
    }

    const userDetails = await User.findById(userID);
    const profileID = userDetails.additionalDetails;
    await Profile.findByIdAndDelete(profileID);
    await User.findByIdAndDelete(userID);

    //logout function required
    //user remove from all enrolled courses
    //HW for schedule delete account
    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.log("User account deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
