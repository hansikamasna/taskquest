const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  inviteMember,
  deleteProject,
} = require('../controllers/projectController');

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.post('/:id/invite', inviteMember);
router.delete('/:id', deleteProject);

module.exports = router;
