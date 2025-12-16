const router = require("express").Router();
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const User = require("../models/User");

router.get("/stats", async (req, res) => {
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ stage: "completed" });
  const pendingTasks = await Task.countDocuments({ stage: { $ne: "completed" } });
  const overdueTasks = await Task.countDocuments({
    dueDate: { $lt: new Date() },
    stage: { $ne: "completed" }
  });

  res.json({ totalTasks, completedTasks, pendingTasks, overdueTasks });
});

router.get("/recent-activity", async (req, res) => {
  const activity = await Activity.find().sort({ createdAt: -1 }).limit(6);
  res.json(activity);
});

router.get("/stage-distribution", async (req, res) => {
  const stages = ["backlog", "todo", "in-progress", "completed"];

  const data = await Promise.all(
    stages.map(async stage => ({
      stage,
      value: await Task.countDocuments({ stage })
    }))
  );

  res.json(data);
});

router.get("/weekly-productivity", async (req, res) => {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 6);

  const data = await Task.aggregate([
    {
      $match: {
        stage: "completed",
        updatedAt: { $gte: lastWeek }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
});

router.get("/upcoming-tasks", async (req, res) => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const todayTasks = await Task.find({
    dueDate: {
      $gte: new Date(today.setHours(0,0,0,0)),
      $lt: new Date(today.setHours(23,59,59,999))
    },
    stage: { $ne: "completed" }
  });

  const upcoming = await Task.find({
    dueDate: { $gt: today, $lte: nextWeek },
    stage: { $ne: "completed" }
  });

  res.json({ todayTasks, upcoming });
});

router.get("/profile-summary/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  const totalTasks = await Task.countDocuments({ createdBy: userId });
  const completed = await Task.countDocuments({
    createdBy: userId,
    stage: "completed"
  });

  res.json({
    name: user.name,
    joined: user.createdAt,
    totalTasks,
    completed
  });
});


module.exports = router;
