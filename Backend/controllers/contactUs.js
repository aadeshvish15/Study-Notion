const contactFormResponse = require("../mail/templates/contactFormResponse");
const mailSender = require("../utils/mailSender");

exports.contactFormResp = async (req, res) => {
  try {
    const { firstname, lastname, email, phoneNo, message } = req.body;

    if (!firstname || !email || !price || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    mailSender(
      email,
      "Message received confirmation",
      contactFormResponse(
        email,
        firstname,
        lastname ? lastname : "",
        message,
        phoneNo ? phoneNo : "no phone number provided"
      )
    );

    mailSender(
      "info@studynotion.com",
      "Message grievance of your student from Study Notion",
      contactFormResponse(
        email,
        firstname,
        lastname ? lastname : "",
        message,
        phoneNo ? phoneNo : "no phone number provided"
      )
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully to both the users",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      success: false,
      message: "Something went wrong in sending mails to users",
    });
  }
};
