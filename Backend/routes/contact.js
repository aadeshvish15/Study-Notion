const express = require("express");
const router = express.Router();

const { contactFormResp } = require("../controllers/contactUs");

router.post("/contact", contactFormResp);

module.exports = router;
