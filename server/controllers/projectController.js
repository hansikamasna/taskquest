const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @route GET /api/projects
const getProjects = async (req, res) => {
  try {
    // Return projects where user is creator or member
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor')
      .sort('-createdAt');

    // Attach task progress stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ projectId: project._id });
        const doneTasks = await Task.countDocuments({ projectId: project._id, status: 'done' });
        return {
          ...project.toObject(),
          totalTasks,
          doneTasks,
          progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        };
      })
    );

    res.json(projectsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// @route POST /api/projects
const createProject = async (req, res) => {
  const { name, description, priority, theme } = req.body;

  try {
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      priority: priority || 'medium',
      theme: theme || 'purple',
      createdBy: req.user._id,
      members: [req.user._id], // Creator is automatically a member
    });

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email avatarColor' },
      { path: 'members', select: 'name email avatarColor' },
    ]);

    res.status(201).json({ ...populated.toObject(), totalTasks: 0, doneTasks: 0, progress: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

// @route GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is a member
    const isMember =
      project.members.some((m) => m._id.toString() === req.user._id.toString()) ||
      project.createdBy._id.toString() === req.user._id.toString();

    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const doneTasks = await Task.countDocuments({ projectId: project._id, status: 'done' });

    res.json({
      ...project.toObject(),
      totalTasks,
      doneTasks,
      progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

// @route POST /api/projects/:id/invite
const inviteMember = async (req, res) => {
  const { email } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only creator can invite
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project creator can invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: 'User not found with that email' });

    if (project.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userToInvite._id);
    await project.save();

    const updated = await project.populate('members', 'name email avatarColor');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to invite member' });
  }
};

// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete project' });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

module.exports = { getProjects, createProject, getProject, inviteMember, deleteProject };
