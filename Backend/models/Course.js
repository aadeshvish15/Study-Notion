const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  courseDescription: {
    type: String,
    required: true,
    trim: true,
  },
  whatYouWillLearn: {
    type: String,
    required: true,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    // trim: true,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingsAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingsAndReview",
    },
  ],
  price: {
    type: Number,
    required: trim,
  },
  thumbnail: {
    type: String,
  },
  tags: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tags",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
