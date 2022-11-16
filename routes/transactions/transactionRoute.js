const router = require("express").Router();
const limitReached = require("../../helpers/sender_service/limitReached");
const verifyToken = require("../../middlewares/verifyToken");
const TransactionModel = require("../../models/TransactionModel");
const UserModel = require("../../models/UserModel");
//TODO:add errors
router.post("/", verifyToken, async (req, res) => {
  const { amount_spent, title, description, spend_type } = req.body;
  const user = await UserModel.findById(req.userToken._id);

  const d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  const month_spent = await TransactionModel.aggregate([
    {
      $match: {
        user_mail: user.email,
      },
    },
    {
      $project: {
        amount_spent: 1,
        month: {
          $month: "$createdAt",
        },
        year: {
          $year: "$createdAt",
        },
      },
    },
    {
      $match: {
        year: year,
        month: month + 1,
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        total: {
          $sum: "$amount_spent",
        },
      },
    },
    {
      $project: {
        month: "$_id.month",
        amount_spent: "$total",
        _id: "$_id.month",
      },
    },
  ]);

  if (month_spent[0].amount_spent + amount_spent >= user.monthly_limit) {
    console.log("TEST");
    const send_mail = await limitReached(user.email, user.phoneNumber, user.monthly_limit);
  }

  const transaction = new TransactionModel({
    user_mail: user.email,
    amount_spent: amount_spent,
    title: title,
    description: description,
    spend_type: spend_type,
  });
  try {
    const save_transaction = await transaction.save();
    res.send(save_transaction);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

//TODO:add errors
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userToken._id);
    const user_transactions = await TransactionModel.aggregate([
      {
        $match: {
          user_mail: user.email,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: parseInt(req.query.limit),
      },
    ]);
    res.send(user_transactions);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

router.get("/graph-data", verifyToken, async (req, res) => {
  const user = await UserModel.findById(req.userToken._id);
  const d = new Date();
  let year = d.getFullYear();
  try {
    const year_transactions = await TransactionModel.aggregate([
      {
        $match: {
          user_mail: user.email,
        },
      },
      {
        $project: {
          amount_spent: 1,
          month: {
            $month: "$createdAt",
          },
          year: {
            $year: "$createdAt",
          },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          total: {
            $sum: "$amount_spent",
          },
        },
      },
      {
        $project: {
          month: "$_id.month",
          amount_spent: "$total",
          _id: "$_id.month",
        },
      },
    ]);
    res.send(year_transactions);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

//TODO:reuse /graph-data api instead of this
router.get("/monthly-spent", verifyToken, async (req, res) => {
  const user = await UserModel.findById(req.userToken._id);
  const d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  try {
    const year_transactions = await TransactionModel.aggregate([
      {
        $match: {
          user_mail: user.email,
        },
      },
      {
        $project: {
          amount_spent: 1,
          month: {
            $month: "$createdAt",
          },
          year: {
            $year: "$createdAt",
          },
        },
      },
      {
        $match: {
          year: year,
          month: month + 1,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          total: {
            $sum: "$amount_spent",
          },
        },
      },
      {
        $project: {
          month: "$_id.month",
          amount_spent: "$total",
          _id: "$_id.month",
        },
      },
    ]);
    res.send(year_transactions);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

//TODO:reuse /graph-data api instead of this
router.get("/lifetime-spent", verifyToken, async (req, res) => {
  const user = await UserModel.findById(req.userToken._id);
  try {
    const lifetime_transaction = await TransactionModel.aggregate([
      {
        $match: {
          user_mail: user.email,
        },
      },
      {
        $group: {
          _id: "$user_mail",
          total: {
            $sum: "$amount_spent",
          },
        },
      },
    ]);
    res.send(lifetime_transaction);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});
module.exports = router;
