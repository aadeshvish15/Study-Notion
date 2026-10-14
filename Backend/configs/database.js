const mongoose = require("mongoose");
require("dotenv").config();

exports.DBconnect = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("DB connection successful");
    })
    .catch((err) => {
      console.error(err);
      console.log("DB connection failed");
      process.exit(1);
    });
};
