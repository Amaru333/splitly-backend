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
};
const whitelist = ["https://splitly.vercel.app/"];
const testCorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
  optionsSuccessStatus: 200,
  credentials: true,
  exposedHeaders: "auth-token",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "device-remember-token", "Access-Control-Allow-Origin", "Origin", "Accept", "x-jwt", "Access-Control-Allow-Credentials", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods", "content-type"],
};
app.use(cors(testCorsOptions));

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
