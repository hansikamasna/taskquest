const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// ── Points multiplier per priority ───────────────────────────
const PRIORITY_MULTIPLIER = { low: 0.5, medium: 1, high: 1.5, critical: 2 };
const BASE_POINTS = 100;

// Calculate points when a task is completed
const calculatePoints = (task) => {
  const multiplier = PRIORITY_MULTIPLIER[task.priority] || 1;
  let points = BASE_POINTS * multiplier;

  if (task.dueDate && task.completedAt) {
    const due = new Date(task.dueDate);
    const completed = new Date(task.completedAt);
    if (completed <= due) {
      points += 50; // Early/on-time bonus
    } else {
      points = Math.max(0, points - 30); // Late penalty
    }
  }
  return Math.round(points);
};

// ── GET /api/tasks/project/:projectId ────────────────────────
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('claimedBy', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .populate('dependencies', 'title status isLocked')
      .sort('order');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// ── POST /api/tasks ───────────────────────────────────────────
const createTask = async (req, res) => {
  const { title, description, projectId, priority, dueDate, dependencies } = req.body;
  try {
    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Task is locked if it has any dependencies
    const hasDepends = Array.isArray(dependencies) && dependencies.length > 0;

    // Check if any provided dependency tasks are themselves incomplete
    let shouldLock = false;
    if (hasDepends) {
      const depTasks = await Task.find({ _id: { $in: dependencies } });
      shouldLock = depTasks.some((d) => d.status !== 'done');
    }

    const maxOrder = await Task.countDocuments({ projectId, status: 'todo' });

    const task = await Task.create({
      title,
      description,
      projectId,
      priority: priority || 'medium',
      dueDate,
      dependencies: hasDepends ? dependencies : [],
      isLocked: shouldLock,
      createdBy: req.user._id,
      order: maxOrder,
    });

    const populated = await task.populate([
      { path: 'claimedBy', select: 'name email avatarColor' },
      { path: 'createdBy', select: 'name email avatarColor' },
      { path: 'dependencies', select: 'title status isLocked' },
    ]);

    const io = req.app.get('io');
    io.to(projectId).emit('task-created', populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// ── POST /api/tasks/:id/claim ─────────────────────────────────
// First-come-first-served claiming logic
const claimTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Cannot claim a locked task
    if (task.isLocked) {
      return res.status(400).json({ message: 'This task is locked. Complete its dependencies first!' });
    }

    // Already claimed by someone else
    if (task.claimedBy) {
      return res.status(400).json({ message: 'Task already claimed by another player!' });
    }

    // Already done
    if (task.status === 'done') {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    // Claim it — move to In Progress automatically
    task.claimedBy = req.user._id;
    task.claimedAt = new Date();
    task.status = 'progress';
    await task.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { tasksClaimed: 1 } });

    const populated = await task.populate([
      { path: 'claimedBy', select: 'name email avatarColor' },
      { path: 'createdBy', select: 'name email avatarColor' },
      { path: 'dependencies', select: 'title status isLocked' },
    ]);

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('task-claimed', populated);

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to claim task' });
  }
};

// ── PATCH /api/tasks/:id/status ──────────────────────────────
// Drag-and-drop status update — only the claimer can move their task
const updateTaskStatus = async (req, res) => {
  const { status, order } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Locked tasks cannot be moved
    if (task.isLocked) {
      return res.status(400).json({ message: 'Unlock this task by completing its dependencies first' });
    }

    // Only the claimer (or creator) can move the task
    const userId = req.user._id.toString();
    const claimerId = task.claimedBy?.toString();
    const creatorId = task.createdBy?.toString();
    if (claimerId && claimerId !== userId && creatorId !== userId) {
      return res.status(403).json({ message: 'Only the player who claimed this task can move it' });
    }

    const wasAlreadyDone = task.status === 'done';
    task.status = status;
    task.order = order;

    // ── Handle task completion: calculate points + unlock dependents
    if (status === 'done' && !wasAlreadyDone) {
      task.completedAt = new Date();
      const points = calculatePoints(task);
      task.pointsAwarded = points;

      // Award points + XP to the claimer
      if (task.claimedBy) {
        const today = new Date().toDateString();
        const claimer = await User.findById(task.claimedBy);
        const lastDate = claimer?.lastCompletedDate
          ? new Date(claimer.lastCompletedDate).toDateString()
          : null;
        const newStreak = lastDate === today
          ? claimer.streak
          : lastDate === new Date(Date.now() - 86400000).toDateString()
          ? (claimer.streak || 0) + 1
          : 1;

        await User.findByIdAndUpdate(task.claimedBy, {
          $inc: { totalPoints: points, tasksCompleted: 1, xp: points },
          streak: newStreak,
          lastCompletedDate: new Date(),
        });
      }

      // ── Skill Tree: unlock any tasks that depended on this one
      const dependentTasks = await Task.find({ dependencies: task._id, isLocked: true });
      for (const depTask of dependentTasks) {
        // Check ALL of depTask's dependencies — are they all done now?
        const allDeps = await Task.find({ _id: { $in: depTask.dependencies } });
        const allDone = allDeps.every((d) => d.status === 'done' || d._id.toString() === task._id.toString());
        if (allDone) {
          depTask.isLocked = false;
          await depTask.save();
          const io = req.app.get('io');
          // Notify all users in the room that a task just unlocked
          io.to(task.projectId.toString()).emit('task-unlocked', {
            taskId: depTask._id,
            taskTitle: depTask.title,
            unlockedBy: task.title,
          });
        }
      }
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('claimedBy', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .populate('dependencies', 'title status isLocked');

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('task-updated', populated);

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update task status' });
  }
};

// ── PUT /api/tasks/:id ────────────────────────────────────────
const updateTask = async (req, res) => {
  const { title, description, priority, dueDate, dependencies } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Recalculate lock status based on new dependencies
    let shouldLock = false;
    if (Array.isArray(dependencies) && dependencies.length > 0) {
      const depTasks = await Task.find({ _id: { $in: dependencies } });
      shouldLock = depTasks.some((d) => d.status !== 'done');
    }

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.dependencies = dependencies || task.dependencies;
    task.isLocked = shouldLock;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('claimedBy', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .populate('dependencies', 'title status isLocked');

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('task-updated', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Remove this task from any other task's dependencies
    await Task.updateMany(
      { dependencies: req.params.id },
      { $pull: { dependencies: req.params.id } }
    );

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('task-deleted', { taskId: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// ── GET /api/tasks/leaderboard ────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const players = await User.find({})
      .select('name email avatarColor totalPoints tasksCompleted tasksClaimed streak xp level')
      .sort({ totalPoints: -1 })
      .limit(10);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  claimTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getLeaderboard,
};
