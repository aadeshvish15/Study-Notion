const Tags = require("../models/Tags");

//create tags
exports.createTags = async (req, res) => {
  try {
    //fetch tagName, tagDescription from frontend
    const { tagName, tagDescription } = req.body;

    //validate
    if (!tagName || !tagDescription) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } else if (await Tags.findOne({ tagName })) {
      return res.status(404).json({
        success: false,
        message: "Tag with this name is already created",
      });
    }

    //create entry in DB
    const tagDetails = await Tags.create({
      tagName,
      tagDescription,
    });
    console.log(tagDetails);

    //   return response
    return res.status(200).json({
      success: true,
      message: "Tag created successfully",
      tagDetails,
    });
  } catch (error) {
    console.log("Something went wrong in tag creation:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//fetch all tags
exports.showAllTags = async (req, res) => {
  try {
    const allTags = Tags.find({}, { tagName: true, tagDescription: true });

    return res.status(200).json({
      success: true,
      message: "All tags fetched successfully",
      allTags,
    });
  } catch (error) {
    console.log("Something went wrong while fetching the tags:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
