const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatarColor: { type: String, default: '#7c3aed' },

    // XP shown in navbar
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // ── Competitive points system
    totalPoints: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    tasksClaimed: { type: Number, default: 0 },
    // Current consecutive days with at least one completion
    streak: { type: Number, default: 0 },
    lastCompletedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
