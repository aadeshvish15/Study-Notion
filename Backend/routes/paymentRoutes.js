const express = require("express");
const router = express.Router();

const { paymentCapture, verifySignature } = require("../controllers/payment");
const { authMiddleware, isStudent } = require("../middlewares/Auth");

router.post("/capturePayment", authMiddleware, isStudent, paymentCapture);
router.post("/verifyPayment", verifySignature);

module.exports = router;
