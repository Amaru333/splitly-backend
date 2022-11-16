const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 255,
  },
  username: {
    type: String,
    required: true,
    max: 255,
  },
  email: {
    type: String,
    required: false,
    max: 255,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  monthly_limit: {
    type: Number,
    default: 1000,
    required: false,
  },
});

module.exports = mongoose.model("User", userSchema);
