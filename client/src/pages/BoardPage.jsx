import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { getProject, getTasksByProject, updateTaskStatus } from '../services/api';
import socket, { joinProject, leaveProject } from '../services/socket';
import Navbar, { Avatar } from '../components/layout/Navbar';
import KanbanColumn from '../components/board/KanbanColumn';
import CreateTaskModal from '../components/board/CreateTaskModal';
import InviteModal from '../components/board/InviteModal';
import toast from 'react-hot-toast';

const COLUMNS = ['todo', 'progress', 'review', 'done'];

const themeAccent = {
  purple: '#a855f7', blue: '#60a5fa', green: '#34d399',
  red: '#f87171', orange: '#fbbf24',
};

const BoardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({});
  const [allTasks, setAllTasks] = useState([]); // flat list for dependency picker
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const groupTasks = useCallback((arr) => {
    return COLUMNS.reduce((acc, col) => {
      acc[col] = arr.filter(t => t.status === col).sort((a, b) => a.order - b.order);
      return acc;
    }, {});
  }, []);

  // Update a single task in state (used by socket events and claim)
  const upsertTask = useCallback((updatedTask) => {
    setAllTasks(prev => {
      const exists = prev.find(t => t._id === updatedTask._id);
      return exists ? prev.map(t => t._id === updatedTask._id ? updatedTask : t) : [...prev, updatedTask];
    });
  }, []);

  // Keep grouped tasks in sync with allTasks
  useEffect(() => {
    setTasks(groupTasks(allTasks));
  }, [allTasks, groupTasks]);

  useEffect(() => {
    const init = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          getProject(projectId),
          getTasksByProject(projectId),
        ]);
        setProject(projectRes.data);
        setAllTasks(tasksRes.data);
      } catch {
        toast.error('Failed to load project');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
    joinProject(projectId);

    // ── Socket.io real-time events ──
    socket.on('task-created', (t) => {
      setAllTasks(prev => [...prev, t]);
    });

    socket.on('task-updated', (t) => {
      upsertTask(t);
    });

    socket.on('task-claimed', (t) => {
      upsertTask(t);
      toast(`⚔️ ${t.claimedBy?.name} claimed "${t.title}"!`, { icon: '🎮' });
    });

    socket.on('task-deleted', ({ taskId }) => {
      setAllTasks(prev => prev.filter(t => t._id !== taskId));
    });

    // Task unlocked notification from skill tree logic
    socket.on('task-unlocked', ({ taskTitle, unlockedBy }) => {
      toast.success(`🔓 "${taskTitle}" is now unlocked!\n(${unlockedBy} was completed)`, { duration: 4000 });
      // Refresh tasks to get updated isLocked states
      getTasksByProject(projectId).then(({ data }) => setAllTasks(data)).catch(() => {});
    });

    return () => {
      leaveProject(projectId);
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-claimed');
      socket.off('task-deleted');
      socket.off('task-unlocked');
    };
  }, [projectId, navigate, upsertTask]);

  // ── Drag and drop ──
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    const movingTask = allTasks.find(t => t._id === draggableId);

    // Prevent moving locked tasks
    if (movingTask?.isLocked) {
      return toast.error('🔒 Complete dependencies before moving this task');
    }

    // Optimistic update
    setAllTasks(prev => prev.map(t =>
      t._id === draggableId ? { ...t, status: dstCol, order: destination.index } : t
    ));

    try {
      await updateTaskStatus(draggableId, dstCol, destination.index);
      if (dstCol === 'done') {
        // Refresh to get updated points + newly unlocked tasks
        const { data } = await getTasksByProject(projectId);
        setAllTasks(data);
        toast.success('✅ Mission complete! Points awarded ⚡');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move task');
      // Revert
      const { data } = await getTasksByProject(projectId);
      setAllTasks(data);
    }
  };

  const handleTaskCreated = (t) => setAllTasks(prev => [...prev, t]);
  const handleTaskUpdated = (t) => upsertTask(t);
  const handleTaskDeleted = (id) => setAllTasks(prev => prev.filter(t => t._id !== id));
  const handleTaskClaimed = (t) => upsertTask(t);
  const handleInvited = (members) => setProject(prev => ({ ...prev, members }));
  const handleEditTask = (task) => { setEditingTask(task); setShowTaskModal(true); };

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'done').length;
  const lockedTasks = allTasks.filter(t => t.isLocked).length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const accent = project ? (themeAccent[project.theme] || '#a855f7') : '#a855f7';

  if (loading) {
    return (
      <div className="min-h-screen bg-quest-bg flex items-center justify-center">
        <div className="text-center">
          <div className="font-game text-quest-purple-light text-xl animate-pulse mb-2">LOADING LEVEL...</div>
          <div className="w-48 h-1 bg-quest-surface rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-quest-purple animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quest-bg">
      <Navbar />
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}12 0%, transparent 60%)` }} />

      <div className="pt-16">
        {/* Project header */}
        <div className="border-b border-quest-border bg-quest-bg/80 backdrop-blur-md">
          <div className="max-w-full px-6 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <button onClick={() => navigate('/dashboard')}
                  className="font-body text-xs text-quest-muted hover:text-quest-text transition-colors mb-1 flex items-center gap-1">
                  ← LEVEL SELECT
                </button>
                <h1 className="font-game text-2xl font-black" style={{ color: accent }}>
                  {project?.name?.toUpperCase()}
                </h1>
                {project?.description && (
                  <p className="font-body text-quest-muted text-sm mt-0.5">{project.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Stats */}
                <div className="flex gap-3 text-center">
                  <div className="px-3 py-2 rounded-lg bg-quest-surface border border-quest-border">
                    <div className="font-game text-base text-quest-green-light">{doneTasks}</div>
                    <div className="font-body text-xs text-quest-muted">DONE</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-quest-surface border border-quest-border">
                    <div className="font-game text-base text-quest-muted">🔒{lockedTasks}</div>
                    <div className="font-body text-xs text-quest-muted">LOCKED</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="hidden sm:block">
                  <div className="flex justify-between mb-1">
                    <span className="font-body text-xs text-quest-muted">PROGRESS</span>
                    <span className="font-game text-xs ml-4" style={{ color: accent }}>{progress}%</span>
                  </div>
                  <div className="w-28 h-2 bg-quest-surface rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${accent}80, ${accent})` }} />
                  </div>
                </div>

                {/* Team */}
                <div className="flex -space-x-2">
                  {(project?.members || []).slice(0, 5).map(m => <Avatar key={m._id} user={m} size="sm" />)}
                </div>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 rounded-xl font-game text-xs text-white tracking-wide"
                  style={{ background: accent, boxShadow: `0 0 12px ${accent}50` }}>
                  + INVITE
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="px-4 py-2 rounded-xl font-game text-xs tracking-wide border transition-all text-quest-muted hover:text-quest-text"
                  style={{ border: `1px solid ${accent}40` }}>
                  + MISSION
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Legend bar */}
        <div className="px-6 py-2 flex items-center gap-6 border-b border-quest-border bg-quest-bg/50">
          <span className="font-body text-xs text-quest-muted">
            🔒 <span className="text-quest-text">Locked</span> — complete dependencies to unlock
          </span>
          <span className="font-body text-xs text-quest-muted">
            ⚔️ <span className="text-quest-purple-light">CLAIM</span> — first player to claim works on it
          </span>
          <span className="font-body text-xs text-quest-muted">
            🏆 <span className="text-quest-orange-light">Points</span> — earned on completion
          </span>
        </div>

        {/* Kanban Board */}
        <div className="px-6 py-6 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-5 min-w-max">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col}
                  columnId={col}
                  tasks={tasks[col] || []}
                  onAddTask={() => { setEditingTask(null); setShowTaskModal(true); }}
                  onDeleteTask={handleTaskDeleted}
                  onEditTask={handleEditTask}
                  onTaskClaimed={handleTaskClaimed}
                />
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        projectId={projectId}
        members={project?.members || []}
        onCreated={handleTaskCreated}
        editTask={editingTask}
        onUpdated={handleTaskUpdated}
        existingTasks={allTasks}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={projectId}
        onInvited={handleInvited}
      />
    </div>
  );
};

export default BoardPage;
