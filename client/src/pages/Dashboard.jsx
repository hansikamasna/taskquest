import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../services/api';
import Navbar, { Avatar } from '../components/layout/Navbar';
import ProjectCard from '../components/board/ProjectCard';
import CreateProjectModal from '../components/board/CreateProjectModal';
import Leaderboard from '../components/board/Leaderboard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' | 'leaderboard'

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (p) => setProjects(prev => [p, ...prev]);

  const totalTasks = projects.reduce((s, p) => s + (p.totalTasks || 0), 0);
  const completedTasks = projects.reduce((s, p) => s + (p.doneTasks || 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-quest-bg">
      <Navbar />
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(37,99,235,0.08) 0%, transparent 50%)' }} />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">

        {/* Player HUD */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div>
              <p className="font-body text-quest-muted text-sm tracking-widest">WELCOME BACK, PLAYER</p>
              <h1 className="font-game text-2xl md:text-3xl font-black text-quest-text">
                {user?.name?.toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-body text-xs text-quest-orange-light">⚡ {user?.xp || 0} XP</span>
                <span className="font-body text-xs text-quest-purple-light">LVL {user?.level || 1}</span>
                <span className="font-body text-xs text-quest-green-light">🏆 {user?.totalPoints || 0} pts</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { label: 'LEVELS',   value: projects.length,  color: '#a855f7' },
              { label: 'MISSIONS', value: totalTasks,        color: '#60a5fa' },
              { label: 'CLEARED',  value: completedTasks,    color: '#34d399' },
            ].map(stat => (
              <div key={stat.label} className="text-center px-4 py-3 rounded-xl bg-quest-surface border border-quest-border">
                <div className="font-game text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="font-body text-xs text-quest-muted tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Overall progress */}
        {totalTasks > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-quest-surface border border-quest-border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-body text-quest-muted text-sm tracking-widest">CAMPAIGN PROGRESS</span>
              <span className="font-game text-quest-purple-light text-sm">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-quest-bg rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #60a5fa)' }} />
            </div>
          </motion.div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'levels',      label: '🗺️ LEVEL SELECT' },
            { id: 'leaderboard', label: '🏆 LEADERBOARD'  },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-xl font-game text-sm tracking-wide transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(124,58,237,0.2)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(124,58,237,0.6)' : 'rgba(42,42,74,0.5)'}`,
                color: activeTab === tab.id ? '#a855f7' : '#94a3b8',
              }}>
              {tab.label}
            </button>
          ))}

          {activeTab === 'levels' && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-quest-purple hover:bg-quest-purple-light rounded-xl font-game text-white text-sm tracking-wide transition-all"
              style={{ boxShadow: '0 0 15px rgba(124,58,237,0.3)' }}>
              + NEW LEVEL
            </motion.button>
          )}
        </div>

        {/* Tab content */}
        {activeTab === 'levels' ? (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-56 rounded-2xl bg-quest-surface animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="font-game text-xl text-quest-muted mb-2">NO LEVELS FOUND</h3>
              <p className="font-body text-quest-muted mb-6">Create your first project to begin your quest</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                className="px-8 py-3 bg-quest-purple rounded-xl font-game text-white tracking-wide">
                + CREATE FIRST LEVEL
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} />
              ))}
            </div>
          )
        ) : (
          <Leaderboard />
        )}
      </div>

      <CreateProjectModal isOpen={showModal} onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />
    </div>
  );
};

export default Dashboard;
