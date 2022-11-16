const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user_mail: {
    type: String,
    required: true,
    max: 255,
  },
  amount_spent: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    max: 255,
  },
  description: {
    type: String,
    required: false,
  },
  spend_type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
