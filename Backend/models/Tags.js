const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  tagDescription: {
    type: String,
    required: true,
    trim: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

module.exports = mongoose.model("Tags", tagsSchema);
