const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  courseName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  completedVideo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);