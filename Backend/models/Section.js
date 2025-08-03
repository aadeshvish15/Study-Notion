const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  noOfLectures: {
    type: Number,
    required: true,
  },
  timeDuration: {
    type: Number,
    required: true,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection",
    },
  ],
});

module.exports = mongoose.model("Section", sectionSchema);