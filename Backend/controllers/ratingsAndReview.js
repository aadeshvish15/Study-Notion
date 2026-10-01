const RatingsAndReview = require("../models/RatingsAndReview");
const User = require("../models/User");
const Course = require("../models/Course");

exports.createRatingandReview = async (req, res) => {
  try {
    const { courseID } = req.params;
    const { userID } = req.user._id;
    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Atleast rating of the course is required",
      });
    }
    const courseDetails = await Course.findOne({
      _id: courseID,
      studentsEnrolled: { $elemMatch: { $eq: userID } },
    });
    const userDetails = await User.findById(userID);

    if (!courseDetails || !userDetails) {
      return res.status(500).json({
        success: false,
        message: "User or Course not found with this ID",
      });
    }

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    const alreadyReviewed = await RatingsAndReview.findOne({
      users: userID,
      course: courseID,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        successfalse,
        message: "Course is already reviewed by student",
      });
    }

    const ratingReview = await RatingsAndReview.create({
      ratings: rating,
      reviews: review,
      course: courseID,
      user: userID,
    });

    await Course.findByIdAndUpdate(
      courseID,
      {
        $push: {
          ratingsAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rating and review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: "Something went wrong while creating rating and review",
    });
  }
};

exports.averageRating = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check whether courseId is a valid MongoDB ObjectId
    if (!(await Course.findById(courseId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const result = await RatingsAndReview.aggregate([
      // 1. Get only reviews belonging to this course
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },

      // 2. Put all those reviews into one group
      // 3. Calculate the average of their ratings
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$ratings",
          },
        },
      },
    ]);

    // If course has no ratings
    const averageRating = result.length > 0 ? result[0].averageRating : 0;

    return res.status(200).json({
      success: true,
      message: "Average rating fetched successfully",
      averageRating,
    });
  } catch (error) {
    console.error("Error while calculating average rating:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate average rating",
    });
  }
};

exports.getAllCourseRating = async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseDetails = await Course.findById(courseId);
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const reviews = await RatingsAndReview.find({ course: courseId }).populate({
      path: "user",
      select: "firstName lastName additionalDetails",
      populate: {
        path: "additionalDetails",
        select: "profileImage",
      },
    });

    const reviewData = reviews.map((review) => ({
      userName: `${review.user.firstName} ${review.user.lastName}`,
      profileImage: review.user.additionalDetails?.profileImage,
      rating: review.ratings,
      review: review.reviews,
      ratingDate: review.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Ratings and reviews fetched successfully",
      reviewInfo: reviewData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};
