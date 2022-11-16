const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    max: 255,
  },
  createdBy: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  group_spend: {
    type: Number,
    required: false,
    default: 0,
  },
  members: [
    {
      email: String,
      amount_spent: {
        type: Number,
        default: 0,
        required: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Activity", activitySchema);
