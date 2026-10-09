const express = require("express");
const router = express.Router();

const { paymentCapture, verifySignature } = require("../controllers/payment");
const { authMiddleware, isStudent } = require("../middlewares/auth");

router.post("/capturePayment", authMiddleware, isStudent, paymentCapture);
router.post("/verifyPayment", authMiddleware, isStudent, verifySignature);

module.exports = router;
