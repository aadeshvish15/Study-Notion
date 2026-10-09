const express = require("express");
const router = express.Router();

// Course controllers
const {
  createCourse,
  showAllCourses,
  fetchCourseDetails,
} = require("../controllers/course");

// Section controllers
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

// SubSection controllers
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/subSection");

// Category controllers
const {
  createCategory,
  showAllcategory,
  categoryPageDetails,
} = require("../controllers/category");

// RatingsAndReview controllers
const {
  createRatingandReview,
  averageRating,
  getCourseAllRating,
} = require("../controllers/ratingsAndReview");

// Middleware
const {
  authMiddleware,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/Auth");

// ********** Course routes **********
router.post("/createCourse", authMiddleware, isInstructor, createCourse);
router.get("/getAllCourses", showAllCourses);
router.post("/getCourseDetails", fetchCourseDetails);

// ********** Section routes **********
router.post("/addSection", authMiddleware, isInstructor, createSection);
router.post("/updateSection", authMiddleware, isInstructor, updateSection);
router.post("/deleteSection", authMiddleware, isInstructor, deleteSection);

// ********** SubSection routes **********
router.post("/addSubSection", authMiddleware, isInstructor, createSubSection);
router.post(
  "/updateSubSection",
  authMiddleware,
  isInstructor,
  updateSubSection
);
router.post(
  "/deleteSubSection",
  authMiddleware,
  isInstructor,
  deleteSubSection
);

// ********** Category routes **********
router.post("/createCategory", authMiddleware, isAdmin, createCategory);
router.get("/showAllCategories", showAllcategory);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ********** Rating and Review routes **********
router.post("/createRating", authMiddleware, isStudent, createRatingandReview);
router.get("/getAverageRating", averageRating);
router.get("/getCourseReviews", getCourseAllRating);

module.exports = router;
