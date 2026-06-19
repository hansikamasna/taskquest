const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // Priority acts as game "difficulty"
    priority: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'legendary'],
      default: 'medium',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Visual theme for the project level
    theme: {
      type: String,
      enum: ['purple', 'blue', 'green', 'red', 'orange'],
      default: 'purple',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
