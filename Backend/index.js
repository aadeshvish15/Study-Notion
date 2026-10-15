const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressFileUpload = require("express-fileupload");
const app = express();

const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const contactRoutes = require("./routes/contact");

const database = require("./configs/database");
const { cloudinaryConnect } = require("./configs/cloudinary");
const dotenv = require("dotenv");

const PORT = process.env.PORT || 4000;
dotenv.config();
database.DBconnect();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: "/temp",
  })
);

cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/contact", contactRoutes);

app.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});
