import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { inviteMember } from '../../services/api';
import toast from 'react-hot-toast';

const InviteModal = ({ isOpen, onClose, projectId, onInvited }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await inviteMember(projectId, email.trim());
      toast.success('Player invited to the team! 🤝');
      onInvited(data.members);
      setEmail('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm card-glass rounded-2xl p-6 border border-quest-green/40"
            style={{ boxShadow: '0 0 30px rgba(5,150,105,0.3)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-game text-xl text-quest-text">INVITE PLAYER</h2>
              <button onClick={onClose} className="text-quest-muted hover:text-quest-text text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="block font-body text-quest-muted text-xs mb-2 tracking-widest">PLAYER EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                autoFocus
                className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-green transition-colors mb-4"
              />
              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 bg-quest-surface border border-quest-border rounded-xl font-body text-quest-muted">
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-quest-green hover:bg-quest-green-light rounded-xl font-game text-white font-bold tracking-wide disabled:opacity-50">
                  {loading ? '...' : 'INVITE'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;
