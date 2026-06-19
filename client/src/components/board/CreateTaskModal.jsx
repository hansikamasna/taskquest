import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask, updateTask } from '../../services/api';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, projectId, onCreated, editTask, onUpdated, existingTasks = [] }) => {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', dueDate: '', dependencies: [],
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!editTask;

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        priority: editTask.priority || 'medium',
        dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
        dependencies: (editTask.dependencies || []).map(d => d._id || d),
      });
    } else {
      setForm({ title: '', description: '', priority: 'medium', dueDate: '', dependencies: [] });
    }
  }, [editTask, isOpen]);

  const toggleDependency = (taskId) => {
    setForm(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(taskId)
        ? prev.dependencies.filter(id => id !== taskId)
        : [...prev.dependencies, taskId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Mission title is required');
    setLoading(true);
    try {
      if (isEdit) {
        const { data } = await updateTask(editTask._id, form);
        onUpdated(data);
        toast.success('Mission updated ✅');
      } else {
        const { data } = await createTask({ ...form, projectId });
        onCreated(data);
        toast.success(data.isLocked ? '🔒 Mission created (locked until dependencies done)' : '🎯 New mission created!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const priorities = ['low', 'medium', 'high', 'critical'];
  const priorityColors = { low: '#34d399', medium: '#fbbf24', high: '#f87171', critical: '#a855f7' };
  const pointsMap = { low: 50, medium: 100, high: 150, critical: 200 };

  // Tasks available as dependencies (all tasks except the one being edited)
  const availableDeps = existingTasks.filter(t => !editTask || t._id !== editTask._id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg card-glass rounded-2xl p-6 border border-quest-blue/40 max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 40px rgba(37,99,235,0.3)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-game text-xl text-quest-text">{isEdit ? 'EDIT MISSION' : 'NEW MISSION'}</h2>
              <button onClick={onClose} className="text-quest-muted hover:text-quest-text text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">MISSION TITLE *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Design the login screen"
                  className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-blue transition-colors" />
              </div>

              {/* Description */}
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">DESCRIPTION</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Mission briefing..." rows={2}
                  className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-blue transition-colors resize-none" />
              </div>

              {/* Priority */}
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">
                  PRIORITY — <span className="text-quest-orange-light">+{pointsMap[form.priority]} base pts</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorities.map(p => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                      className="py-2 rounded-lg font-body text-xs capitalize transition-all"
                      style={{
                        background: form.priority === p ? `${priorityColors[p]}20` : 'rgba(26,26,46,0.5)',
                        border: `1px solid ${form.priority === p ? priorityColors[p] : '#2a2a4a'}`,
                        color: priorityColors[p],
                        fontWeight: form.priority === p ? 'bold' : 'normal',
                        opacity: form.priority === p ? 1 : 0.6,
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">
                  DUE DATE — <span className="text-quest-green-light text-xs">+50 pts if completed on time</span>
                </label>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text focus:outline-none focus:border-quest-blue transition-colors" />
              </div>

              {/* ── Skill Tree: Dependencies ── */}
              {availableDeps.length > 0 && (
                <div>
                  <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">
                    🔗 DEPENDENCIES (Skill Tree)
                  </label>
                  <p className="font-body text-xs text-quest-muted mb-2">
                    Select tasks that must be completed BEFORE this mission unlocks.
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {availableDeps.map(t => {
                      const isSelected = form.dependencies.includes(t._id);
                      return (
                        <button key={t._id} type="button" onClick={() => toggleDependency(t._id)}
                          className="w-full text-left px-3 py-2 rounded-lg font-body text-sm flex items-center gap-2 transition-all"
                          style={{
                            background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(26,26,46,0.4)',
                            border: `1px solid ${isSelected ? 'rgba(124,58,237,0.5)' : 'rgba(42,42,74,0.5)'}`,
                          }}>
                          <span className="text-base">{isSelected ? '🔗' : '○'}</span>
                          <span className={isSelected ? 'text-quest-purple-light' : 'text-quest-muted'}>
                            {t.title}
                          </span>
                          <span className="ml-auto text-xs"
                            style={{ color: t.status === 'done' ? '#34d399' : '#94a3b8' }}>
                            {t.status === 'done' ? '✓ done' : t.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {form.dependencies.length > 0 && (
                    <p className="font-body text-xs text-quest-purple-light mt-2">
                      🔒 This mission will be LOCKED until {form.dependencies.length} task(s) are completed.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 bg-quest-surface border border-quest-border rounded-xl font-body text-quest-muted hover:text-quest-text transition-colors">
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-quest-blue hover:bg-quest-blue-light rounded-xl font-game text-white font-bold tracking-wide transition-all disabled:opacity-50">
                  {loading ? '...' : isEdit ? 'UPDATE' : 'CREATE'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
