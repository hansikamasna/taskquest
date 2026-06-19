const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const avatarColors = [
  '#7c3aed', '#2563eb', '#059669', '#dc2626',
  '#d97706', '#db2777', '#0891b2', '#65a30d',
];

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarColor: user.avatarColor,
  xp: user.xp,
  level: user.level,
  totalPoints: user.totalPoints,
  tasksCompleted: user.tasksCompleted,
  tasksClaimed: user.tasksClaimed,
  streak: user.streak,
});

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const user = await User.create({ name, email, password, avatarColor });

    res.status(201).json({ ...formatUser(user), token: generateToken(user._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ ...formatUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(formatUser(user));
};

module.exports = { register, login, getMe };
