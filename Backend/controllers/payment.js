const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const instance = require("../configs/razorpay");
const courseEnrollmentEmail = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

exports.paymentCapture = async (req, res) => {
  const { courseID } = req.body;
  const { userID } = req.user._id;
  const courseDetails = await Course.findById(courseID);
  const userDetails = await User.findById(userID);
  try {
    if (!userID || !courseID) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Could not find course with this ID",
      });
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Could not find user with this ID",
      });
    }
    const uID = new mongoose.Types.ObjectId(userID);
    const isCourseBought = courseDetails.studentsEnrolled.includes(uID);

    if (isCourseBought) {
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in the course",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching user or course details",
    });
  }

  try {
    //order creation
    const priceOfCourse = courseDetails.price;
    const currency = "INR";

    const options = {
      amount: priceOfCourse * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseID: courseID,
        userID: userID,
      },
    };

    const paymentResponse = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      // paymentResponse,
      courseName: courseDetails.courseName,
      courseDescription: courseDetails.courseDescription,
      thumbnail: courseDetails.thumbnail,
      orderID: paymentResponse._id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Could not initiate order",
    });
  }
};

exports.verifySignature = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const shaSum = crypto.createHmac("sha256", process.env.WebHookSecretKey);
  shaSum.update(JSON.stringify(req.body));
  const digest = shaSum.digest("hex");

  if (signature === digest) {
    const { courseID, userID } = req.body.payload.options.notes;
    // return res.status(200).json({
    //   success: true,
    //   message: "Payment is Authorised",
    // });
    try {
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseID },
        { $push: { studentsEnrolled: userID } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: true,
          message: "Course not found",
        });
      }

      const userCourseEnrolled = await User.findByIdAndUpdate(
        { _id: courseID },
        { $push: { courses: courseID } },
        { new: true }
      );

      const emailResponse = mailSender(
        userCourseEnrolled.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          (enrolledCourse.courseName, userCourseEnrolled.firstName)
        )
      );

      return res.status(200).json({
        success: true,
        message: "Signature verified and course added in user list",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Payment failed",
      });
    }
  } else {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Invalid",
    });
  }
};
