const router = require("express").Router();
const UserModel = require("../../models/UserModel");

const moment = require("moment");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const verifyEmail = require("../../helpers/sender_service/verifyEmail");
const verifyToken = require("../../middlewares/verifyToken");
const TransactionModel = require("../../models/TransactionModel");

//Register user
router.post("/register", async (req, res) => {
  //Validating data
  const validation = async () => {
    let errors = [];
    if (req.body.name.length < 1) errors.push({ field: "name", message: "Name is required" });
    if (req.body.username.length < 4) errors.push({ field: "username", message: "Username is required and must be greater than 3 characters" });
    if (req.body.email.length < 3) errors.push({ field: "email", message: "Valid Email is required" });
    if (req.body.phoneNumber.length != 10) errors.push({ field: "phoneNumber", message: "Phone number is required" });
    if (req.body.password.length < 8) errors.push({ field: "password", message: "Password must be greater than 8 characters" });

    //Checking if user's phone number exists
    const number_exists = await UserModel.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    // if (number_exists) return res.status(400).send({ message: 'Phone number already exists', errorCode: 400 });
    if (number_exists) errors.push({ field: "phoneNumber", message: "Phone number already exists" });

    //Checking if user's email exists
    const email_exists = await UserModel.findOne({
      email: req.body.email,
    });
    // if (email_exists) return res.status(400).send({ message: 'Email already exists', errorCode: 400 });
    if (email_exists) errors.push({ field: "email", message: "Email already exists" });

    //Checking if username exists
    const username_exists = await UserModel.findOne({
      username: req.body.username,
    });
    // if (username_exists) return res.status(400).send({ message: 'Username already exists', errorCode: 400 });
    if (username_exists) errors.push({ field: "username", message: "Username already exists" });
    return errors;
  };

  const error_validation = await validation();

  if (error_validation.length > 0) {
    return res.status(400).send({ error: error_validation.reduce((obj, item) => Object.assign(obj, { [item.field]: item.message }), {}) });
  }

  const { name, username, email, password, phoneNumber } = req.body;

  //Hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //Creating a new user
  const user = new UserModel({
    name: name,
    username: username,
    email: email,
    phoneNumber: phoneNumber,
    password: hashedPassword,
  });

  //Saving the user in database
  try {
    const save_user = await user.save();

    const res_data = {
      _id: save_user._id,
      username: save_user.username,
      email: save_user.email,
    };

    const requestId = await verifyEmail(30, save_user._id, save_user.email);
    res.send({
      email_res: requestId,
      reg_res: res_data,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const validations = async () => {
    let errors = [];
    if (email.length < 3) errors.push({ field: "email", message: "Please enter valid email ID" });
    if (password.length < 8) errors.push({ field: "password", message: "Password must be more than or equal to 8 characters" });
    return errors;
  };

  const error_validation = await validations();

  if (error_validation.length > 0) return res.status(400).send({ error: error_validation.reduce((obj, item) => Object.assign(obj, { [item.field]: item.message }), {}) });

  //Checking if user exists
  const user = await UserModel.findOne({ email: email });
  if (!user) return res.status(400).send({ error: { email: "User does not exist" } });

  //Check if password matches
  const valid_password = await bcrypt.compare(password, user.password);
  if (!valid_password) return res.status(400).send({ error: { password: "Password Invalid" } });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN_KEY);

  const res_data = {
    logged: true,
    _id: user._id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    name: user.name,
    username: user.username,
    verified: user.verified,
    monthly_limit: user.monthly_limit,
  };

  res.header("auth-token", token).send(res_data);
});

router.patch("/update-address", async (req, res) => {
  const { _id, email, new_email } = req.body;

  if (new_email.length < 3) return res.status(400).send({ error: { new_email: "Please enter a valid new email ID" } });
  if (new_email == email) return res.status(400).send({ error: { new_email: "New email cannot be same as old email ID" } });

  //Checking if user's new email exists
  const new_email_exists = await UserModel.findOne({
    email: new_email,
  });
  if (new_email_exists) return res.status(400).send({ error: { new_email: "New email already exists with an account" } });

  let updated_fields = {
    email: new_email,
  };

  const update_user_details = await UserModel.updateOne({ _id: _id }, updated_fields);
  const updated_user = await UserModel.findById(_id);

  const requestId = await verifyEmail(30, updated_user._id, updated_user.email);

  const res_data = {
    _id: updated_user._id,
    username: updated_user.username,
  };

  res.send({
    email_res: requestId,
    reg_res: res_data,
  });
});

router.post("/resend-verification", async (req, res) => {
  const { _id, email } = req.body;
  const requestId = await verifyEmail(30, _id, email);
  res.send(requestId);
});

router.get("/verify-token/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.header("auth-token");

  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN_KEY);

    if (!verified)
      res.status(400).send({
        error: {
          auth: "Mismatch auth credentials",
        },
      });
    if (verified._id !== id)
      res.status(400).send({
        error: {
          auth: "Mismatch auth credentials",
        },
      });

    const user = await UserModel.findById(verified._id);
    const res_data = {
      logged: true,
      _id: user._id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      name: user.name,
      username: user.username,
      verified: user.verified,
      monthly_limit: user.monthly_limit,
    };

    res.send(res_data);
  } catch (err) {
    res.status(400).send({
      error: {
        auth: "Mismatch auth credentials",
      },
    });
  }
});

router.patch("/verify-mail", async (req, res) => {
  const { expiry, _id } = req.body;
  // console.log(expiry, moment().toISOString(), expiry < moment().utc().toISOString());
  const user = await UserModel.findById(_id);

  if (expiry < moment().utc().toISOString()) {
    const requestId = await verifyEmail(30, _id, user.email);
    return res.status(400).send({
      error: { verification: "Sorry, your verification link has expired. A new link has been sent to your mail ID. Please verify with the new link." },
      new_verification: {
        email_res: requestId,
        user_res: {
          _id: _id,
          username: user.username,
        },
      },
    });
  }

  let updated_fields = {
    verified: true,
  };
  const verify_user = await UserModel.updateOne({ _id: _id }, updated_fields);
  const updated_user = await UserModel.findById(_id);

  const res_data = {
    logged: true,
    _id: updated_user._id,
    phoneNumber: updated_user.phoneNumber,
    email: updated_user.email,
    name: updated_user.name,
    username: updated_user.username,
    verified: updated_user.verified,
    monthly_limit: updated_user.monthly_limit,
  };

  res.send(res_data);
});

router.patch("/update-limit", verifyToken, async (req, res) => {
  const user = await UserModel.findById(req.userToken._id);

  let updated_fields = {
    monthly_limit: req.body.monthly_limit,
  };

  const update_user_details = await UserModel.updateOne({ _id: user._id }, updated_fields);
  const updated_user = await UserModel.findById(user._id);

  const res_data = {
    logged: true,
    _id: updated_user._id,
    phoneNumber: updated_user.phoneNumber,
    email: updated_user.email,
    name: updated_user.name,
    username: updated_user.username,
    verified: updated_user.verified,
    monthly_limit: updated_user.monthly_limit,
  };

  res.send(res_data);
});

router.get("/stats", async (req, res) => {
  const user_count = await UserModel.aggregate([
    {
      $count: "count",
    },
  ]);
  const transaction_count = await TransactionModel.aggregate([
    {
      $count: "count",
    },
  ]);

  res.send({ users: user_count, transactions: transaction_count });
});

module.exports = router;
