const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

//Database connection
mongoose.connect(process.env.DB_CONNECTION, () => console.log("Connected to database"));

//Middlewares
app.use(express.json());

const corsOptions = {
  exposedHeaders: "auth-token",
  // allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
};
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//Users Route
const userRoute = require("./routes/users/userRoute");
app.use("/api/users", userRoute);

//Transaction Route
const transactionRoute = require("./routes/transactions/transactionRoute");
app.use("/api/transactions", transactionRoute);

//Activity Route
const activityRoute = require("./routes/activity/activityRoute");
app.use("/api/activity", activityRoute);

app.listen(process.env.PORT || 3002, () => console.log("Listening to port 3002"));
