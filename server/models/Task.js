const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    dueDate: { type: Date },

    // ── Skill Tree: tasks that must be done before this one unlocks
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    // Whether all dependencies are met — false means task is locked
    isLocked: { type: Boolean, default: false },

    // ── Competitive Claiming: first-come-first-served
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    pointsAwarded: { type: Number, default: 0 },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
