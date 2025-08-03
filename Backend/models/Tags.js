const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
  tagName: {
    type: String,
    trim: true,
  },
  tagDescription: {
    type: String,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

module.exports = mongoose.model("Tags", tagsSchema);
