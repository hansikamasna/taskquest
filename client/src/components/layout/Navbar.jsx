import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const Avatar = ({ user, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-game font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: user?.avatarColor || '#7c3aed', boxShadow: `0 0 10px ${user?.avatarColor || '#7c3aed'}66` }}>
      {initials}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Session ended. See you next time! 👋');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-quest-border bg-quest-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard">
          <motion.div whileHover={{ scale: 1.03 }} className="font-game text-xl font-black">
            <span className="text-glow-purple" style={{ color: '#a855f7' }}>TASK</span>
            <span className="text-glow-blue" style={{ color: '#60a5fa' }}>QUEST</span>
          </motion.div>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {/* Points display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-quest-surface border border-quest-border">
              <span className="text-quest-orange-light text-xs font-game">🏆</span>
              <span className="text-quest-text font-body font-semibold text-sm">{(user.totalPoints || 0).toLocaleString()}</span>
              <span className="text-quest-muted text-xs font-body">pts</span>
            </div>

            {/* XP display */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-quest-surface border border-quest-border">
              <span className="text-quest-purple-light text-xs font-game">⚡</span>
              <span className="text-quest-text font-body font-semibold text-sm">{user.xp || 0}</span>
              <span className="text-quest-muted text-xs font-body">xp</span>
            </div>

            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar user={user} />
                <span className="hidden sm:block font-body text-quest-text font-medium">{user.name}</span>
              </button>

              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-52 card-glass rounded-xl border border-quest-border py-2 shadow-xl">
                  <div className="px-4 py-2 border-b border-quest-border">
                    <p className="font-body text-quest-text text-sm font-semibold">{user.name}</p>
                    <p className="font-body text-quest-muted text-xs">{user.email}</p>
                  </div>
                  <div className="px-4 py-2 border-b border-quest-border">
                    <div className="flex justify-between font-body text-xs">
                      <span className="text-quest-muted">Tasks Done</span>
                      <span className="text-quest-green-light">{user.tasksCompleted || 0}</span>
                    </div>
                    <div className="flex justify-between font-body text-xs mt-1">
                      <span className="text-quest-muted">Streak</span>
                      <span className="text-quest-orange-light">🔥 {user.streak || 0} days</span>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 font-body text-quest-red-light hover:bg-quest-surface transition-colors text-sm">
                    ✕ Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
