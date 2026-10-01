const Category = require("../models/Category");

//create category
exports.createCategory = async (req, res) => {
  try {
    //fetch categoryName, categoryDescription from frontend
    const { categoryName, categoryDescription } = req.body;

    //validate
    if (!categoryName || !categoryDescription) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } else if (await Category.findOne({ categoryName })) {
      return res.status(404).json({
        success: false,
        message: "Category with this name is already created",
      });
    }

    //create entry in DB
    const categoryDetails = await Category.create({
      categoryName,
      categoryDescription,
    });
    console.log(categoryDetails);

    //   return response
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      categoryDetails,
    });
  } catch (error) {
    console.log("Something went wrong in category creation:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//fetch all category
exports.showAllcategory = async (req, res) => {
  try {
    const allCategory = Category.find(
      {},
      { categoryName: true, categoryDescription: true }
    );

    return res.status(200).json({
      success: true,
      message: "All category fetched successfully",
      allCategory,
    });
  } catch (error) {
    console.log("Something went wrong while fetching the category:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryID } = res.body;

    const selectedCategoryDetails = await Category.findById(categoryID)
      .populate("courses")
      .exec();

    if (!categoryDetails) {
      res.status(404).json({
        success: false,
        message: "No category with this ID found",
      });
    }

    const differentCategoryDetails = await Category.find({
      _id: { $ne: categoryID },
    })
      .populate("courses")
      .exec();

    //HW OF TOP SELLING COURSES
    return res.status(200).json({
      success: true,
      message: "Course with the category found",
      selectedCategoryDetails,
      differentCategoryDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "No courses found",
    });
  }
};
