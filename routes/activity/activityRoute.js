const router = require("express").Router();
const verifyToken = require("../../middlewares/verifyToken");
const TransactionModel = require("../../models/TransactionModel");
const UserModel = require("../../models/UserModel");
const ActivityModel = require("../../models/ActivityModel");

router.post("/", verifyToken, async (req, res) => {
  const { title, description, members } = req.body;
  const user = await UserModel.findById(req.userToken._id);
  const activity = new ActivityModel({
    title: title,
    description: description,
    members: members,
    createdBy: user.email,
  });
  try {
    const save_activity = await activity.save();
    res.send(save_activity);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userToken._id);
    const user_activity = await ActivityModel.aggregate([
      {
        $match: {
          createdBy: user.email,
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
    console.log(user_activity);
    res.send(user_activity);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: err });
  }
});

module.exports = router;
