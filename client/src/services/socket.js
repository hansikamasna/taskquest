import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Create a single socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually after login
});

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export const joinProject = (projectId) => {
  socket.emit('join-project', projectId);
};

export const leaveProject = (projectId) => {
  socket.emit('leave-project', projectId);
};

export default socket;
