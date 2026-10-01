const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const { fileUpload } = require("../configs/fileUpload");

//create course
exports.createCourse = async (req, res) => {
  try {
    //FETCH DATA FROM REQ BODY
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    //GET THUMBNAIL FROM REQ.FILES
    const thumbNail = req.files?.thumbNailIMG;

    //VALIDATE ALL FIELDS - ALL REQUIRED
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
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
    //CHECK GIVEN category EXISTS IN DB
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(403).json({
        success: false,
        message: "Category details does not exist",
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
      category: category,
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

    //UPDATE THE CATEGORY SCHEMA
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
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

exports.fetchCourseDetails = async (req, res) => {
  try {
    const { courseID } = req.params;
    if (!courseID) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }
    const courseDetails = await Course.findById(courseID)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .populate("ratingsAndReviews")
      .populate("category")
      .exec();

    if (!courseDetails) {
      return res.status(500).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course Details fetched successfully",
      date: courseDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching course details",
    });
  }
};
