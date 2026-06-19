const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  claimTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getLeaderboard,
} = require('../controllers/taskController');

router.get('/leaderboard', getLeaderboard);
router.get('/project/:projectId', getTasksByProject);
router.post('/', createTask);
router.post('/:id/claim', claimTask);       // NEW: claim a task
router.patch('/:id/status', updateTaskStatus);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
