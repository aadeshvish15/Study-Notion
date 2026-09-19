const Course = require("../models/Course");
const User = require("../models/User");
const Tags = require("../models/Tags");
const { fileUpload } = require("../utils/fileUpload");
const Tags = require("../models/Tags");

//create course
exports.createCourse = async (req, res) => {
  try {
    //FETCH DATA FROM REQ BODY
    const { courseName, courseDescription, whatYouWillLearn, price, tags } =
      req.body;
    //GET THUMBNAIL FROM REQ.FILES
    const thumbNail = req.files?.thumbNailIMG;

    //VALIDATE ALL FIELDS - ALL REQUIRED
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tags ||
      !thumbNail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //GET USER ID
    const userID = req.user._id;
    const instructorDetails = await User.findById(userID);
    if (!instructorDetails) {
      return res.status(403).json({
        success: false,
        message: "User does not exist with this id",
      });
    }
    //CHECK GIVEN TAG EXISTS IN DB
    const tagDetails = await Tags.findById(tags);
    if (!tagDetails) {
      return res.status(403).json({
        success: false,
        message: "Tag details does not exist",
      });
    }
    //UPLOAD THUMBNAIL IMAGE TO CLOUDINARY
    const thumbNailImg = await fileUpload(thumbNail, process.env.FOLDER_NAME);

    //CREATE AN ENTRY FOR NEW COURSE IN DB
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      instructor: instructorDetails._id,
      price,
      tags: tags,
      thumbnail: thumbNailImg.secure_url,
    });

    //ADD THE NEW COURSE TO THE INSTRUCTOR'S COURSES ARRAY
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    );

    //UPDATE THE TAG/CATEGORY SCHEMA
    await Tags.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push: { courses: newCourse._id },
      }
    );

    //RETURN RESPONSE
    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log("Something went wrong while creating new course", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

//fetch all courses
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingsAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Courses data fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log("Something went wrong while fetching all courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all courses",
    });
  }
};
