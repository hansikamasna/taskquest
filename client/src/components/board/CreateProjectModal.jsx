import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject } from '../../services/api';
import toast from 'react-hot-toast';

const themes = [
  { id: 'purple', label: 'Void', color: '#7c3aed' },
  { id: 'blue', label: 'Ocean', color: '#2563eb' },
  { id: 'green', label: 'Forest', color: '#059669' },
  { id: 'red', label: 'Inferno', color: '#dc2626' },
  { id: 'orange', label: 'Desert', color: '#d97706' },
];

const priorities = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'legendary', label: 'Legendary' },
];

const CreateProjectModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', theme: 'purple' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setLoading(true);
    try {
      const { data } = await createProject(form);
      toast.success('New level created! 🎮');
      onCreated(data);
      onClose();
      setForm({ name: '', description: '', priority: 'medium', theme: 'purple' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md card-glass rounded-2xl p-6 border border-quest-purple/40"
            style={{ boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-game text-xl text-quest-text">NEW LEVEL</h2>
              <button onClick={onClose} className="text-quest-muted hover:text-quest-text transition-colors text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">PROJECT NAME *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Operation Phoenix"
                  className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-purple transition-colors"
                />
              </div>

              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">DESCRIPTION</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What's this project about?"
                  rows={3}
                  className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-purple transition-colors resize-none"
                />
              </div>

              {/* Priority / Difficulty */}
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">DIFFICULTY</label>
                <div className="grid grid-cols-4 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.id })}
                      className={`py-2 rounded-lg font-body text-sm transition-all ${
                        form.priority === p.id
                          ? 'bg-quest-purple text-white border border-quest-purple-light'
                          : 'bg-quest-bg text-quest-muted border border-quest-border hover:border-quest-purple/50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">WORLD THEME</label>
                <div className="flex gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, theme: t.id })}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-8 h-8 rounded-full transition-all ${form.theme === t.id ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-quest-card' : ''}`}
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-xs font-body text-quest-muted">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-quest-surface border border-quest-border rounded-xl font-body text-quest-muted hover:text-quest-text transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-quest-purple hover:bg-quest-purple-light rounded-xl font-game text-white font-bold tracking-wide transition-all disabled:opacity-50"
                >
                  {loading ? 'CREATING...' : 'CREATE'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
