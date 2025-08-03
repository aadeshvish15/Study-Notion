const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    }
});



//FUNCTION TO SEND EMAILS SPECIFICALLY
async function sendVerificationEmails(email,otp) {
    try {
        const mailSender = await mailSender(email, "Verification email from Sender", otp);
        console.log("Email sent successfully:", mailSender);
    } catch (error) {
        console.log("Verification email sending problem: ",error);
    }
}

OTPSchema.pre("save",async function (next) {
    await sendVerificationEmails(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP",OTPSchema)