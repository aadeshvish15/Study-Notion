const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, courseId } = req.body;
    //validate
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section ID
    const updateCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: newSection._id },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    //return response
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updateCourseDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to create section, please try again",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }

    const updateSectionDetails = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: sectionName,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updateSectionDetails,
    });
  } catch (error) {
    console.log("Something went wrong while updating section", error);
    res.status(500).json({
      success: false,
      message: "Unable to update section, please try again",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.params;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }

    const deleteSectionDetails = await Section.findByIdAndDelete(sectionId);

    const updateCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { courseContent: sectionId },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      deleteSectionDetails,
      updateCourseDetails,
    });
  } catch (error) {
    console.log("Something went wrong while updating section", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete section, please try again",
      error: error.message,
    });
  }
};
