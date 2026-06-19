import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskquest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('taskquest_token');
      localStorage.removeItem('taskquest_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// AUTH
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// PROJECTS
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const inviteMember = (id, email) => api.post(`/projects/${id}/invite`, { email });
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// TASKS
export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);
export const createTask = (data) => api.post('/tasks', data);
export const claimTask = (id) => api.post(`/tasks/${id}/claim`);          // NEW
export const updateTaskStatus = (id, status, order) =>
  api.patch(`/tasks/${id}/status`, { status, order });
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getLeaderboard = () => api.get('/tasks/leaderboard');         // NEW

export default api;
