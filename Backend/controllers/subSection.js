const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { fileUpload } = require("../utils/fileUpload");

exports.createSubSection = async (req, res) => {
  try {
    //fetch data
    const { title, description } = req.body;
    const { sectionID } = req.params;
    const videoFile = req.files?.video;

    //validate
    if (!title || !description || !videoFile) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }

    //insert video to cloudinary
    const videoURL = await fileUpload(videoFile, process.env.FOLDER_NAME);

    //insert in DB
    const newSubSection = await SubSection.create({
      title: title,
      videoUrl: videoURL,
      description: description,
    });

    //add new subsection to section array
    await Section.findByIdAndUpdate(
      sectionID,
      {
        $push: { subSection: newSubSection._id },
      },
      { new: true }
    ).populate({
      path: "subSection",
    });

    //RETURN RESPONSE
    return res.status(200).json({
      success: true,
      message: "Sub section created successfully",
      data: newSubSection,
    });
  } catch (error) {
    console.log("Something went wrong while creating new sub section", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create sub section",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { title, description, subSectionId } = req.body;

    if (!title || !description || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }

    const updateSubSectionDetails = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        title,
        description,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updateSubSectionDetails,
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
    const { subSectionId } = req.body;
    const { sectionID } = req.params;

    if (!subSectionId || !sectionID) {
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });
    }

    const deleteSubSectionDetails = await SubSection.findByIdAndDelete(
      subSectionId
    );

    const updateSubSectionDetails = await Section.findByIdAndUpdate(
      sectionID,
      {
        $pull: { subSection: subSectionId },
      },
      { new: true }
    ).populate({
      path: "subSection",
    });

    return res.status(200).json({
      success: true,
      message: "Sub section deleted successfully",
      deleteSubSectionDetails,
      updateSubSectionDetails,
    });
  } catch (error) {
    console.log("Something went wrong while updating Sub section", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete section, please try again",
      error: error.message,
    });
  }
};
