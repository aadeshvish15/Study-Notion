const mongoose = require("mongoose");

const ratingsAndReviewSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ],
    ratings: {
        type: Number,
        required: true,
        trim:true
    },
    reviews: {
        type: String,
        required: true,
        trim:true
    }
});

module.exports = mongoose.model("RatingsAndReview", ratingsAndReviewSchema);