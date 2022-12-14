const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

const app = express();

//Database connection
mongoose.connect(process.env.DB_CONNECTION, () => console.log("Connected to database"));

//Middlewares
app.use(express.json());

const corsOptions = {
  exposedHeaders: "auth-token",
};
app.use(cors(corsOptions));

//Users Route
const userRoute = require("./routes/users/userRoute");
app.use("/api/users", userRoute);

app.listen(3002, () => console.log("Listening to port 3002"));
