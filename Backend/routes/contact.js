const express = require("express");
const router = express.Router();

const { contactFormResp } = require("../controllers/contactUs");

router.post("/contactUs", contactFormResp);

module.exports = router;
