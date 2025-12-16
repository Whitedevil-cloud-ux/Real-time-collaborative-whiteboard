const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Activity = require("../models/Activity");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// CREATE new task
router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate, stage, createdBy } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      stage,
      createdBy,
    });

    // Log Activity
    await Activity.create({
      taskId: task._id,
      type: "task_created",
      message: `New task created: ${title}`,
    });

    res.status(201).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating task");
  }
});

// UPDATE stage
router.put("/:id/stage", async (req, res) => {
  const { stage } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { stage },
    { new: true }
  );

  // Log activity
  await Activity.create({
    taskId: task._id,
    type: "stage_changed",
    message: `Task moved to ${stage}`,
  });

  res.json(task);
});

// DELETE task
router.delete("/:id", async (req, res) => {
  try {
    console.log("Delete route hit", req.params.id);
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Log activity
    await Activity.create({
      taskId: task._id,
      type: "task_deleted",
      message: `Task deleted: ${task.title}`,
    });

    res.json({ success: true, taskId: task._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;
