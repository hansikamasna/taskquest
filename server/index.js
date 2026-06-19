const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', protect, projectRoutes);
app.use('/api/tasks', protect, taskRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'TaskQuest Server Running 🎮' }));

// Socket.io events
io.on('connection', (socket) => {
  console.log(`⚡ Player connected: ${socket.id}`);

  // Join a project "room" for real-time updates
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`Player ${socket.id} joined project ${projectId}`);
  });

  // Leave a project room
  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🗄️  MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 TaskQuest Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
