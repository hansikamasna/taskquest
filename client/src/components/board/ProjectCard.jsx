import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Theme configs for different project colors
const themeConfig = {
  purple: { glow: 'rgba(124,58,237,0.4)', border: '#7c3aed', accent: '#a855f7', bg: 'rgba(124,58,237,0.1)' },
  blue:   { glow: 'rgba(37,99,235,0.4)',  border: '#2563eb', accent: '#60a5fa', bg: 'rgba(37,99,235,0.1)'  },
  green:  { glow: 'rgba(5,150,105,0.4)',  border: '#059669', accent: '#34d399', bg: 'rgba(5,150,105,0.1)'  },
  red:    { glow: 'rgba(220,38,38,0.4)',  border: '#dc2626', accent: '#f87171', bg: 'rgba(220,38,38,0.1)'  },
  orange: { glow: 'rgba(217,119,6,0.4)',  border: '#d97706', accent: '#fbbf24', bg: 'rgba(217,119,6,0.1)'  },
};

// Difficulty/priority to display label
const priorityLabel = { easy: '★ EASY', medium: '★★ MEDIUM', hard: '★★★ HARD', legendary: '⚡ LEGENDARY' };
const priorityColor = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171', legendary: '#a855f7' };

const ProjectCard = ({ project, index }) => {
  const navigate = useNavigate();
  const theme = themeConfig[project.theme || 'purple'];
  const progress = project.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/board/${project._id}`)}
      className="cursor-pointer rounded-2xl overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, #1a1a2e 0%, ${theme.bg} 100%)`,
        border: `1px solid ${theme.border}40`,
        boxShadow: `0 4px 30px ${theme.glow}`,
      }}
    >
      {/* Top accent line */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${theme.border}, ${theme.accent})` }} />

      <div className="p-6">
        {/* Level badge */}
        <div className="flex items-start justify-between mb-4">
          <span
            className="px-2 py-0.5 rounded font-game text-xs font-bold"
            style={{ color: priorityColor[project.priority || 'medium'], background: `${priorityColor[project.priority || 'medium']}20` }}
          >
            {priorityLabel[project.priority || 'medium']}
          </span>
          <span className="font-game text-xs text-quest-muted">LEVEL {index + 1}</span>
        </div>

        {/* Project name */}
        <h3 className="font-game text-lg text-quest-text font-bold mb-1 truncate">
          {project.name}
        </h3>

        {project.description && (
          <p className="font-body text-quest-muted text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-body text-xs text-quest-muted tracking-widest">PROGRESS</span>
            <span className="font-game text-xs" style={{ color: theme.accent }}>{progress}%</span>
          </div>
          <div className="h-2 bg-quest-bg rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${theme.border}, ${theme.accent})` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              {(project.members || []).slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-game font-bold text-white border-2 border-quest-card"
                  style={{ backgroundColor: member.avatarColor || '#7c3aed' }}
                  title={member.name}
                >
                  {member.name?.[0]?.toUpperCase()}
                </div>
              ))}
              {project.members?.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-quest-border flex items-center justify-center text-xs font-body text-quest-muted border-2 border-quest-card">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="font-body text-xs text-quest-muted">
            {project.doneTasks}/{project.totalTasks} tasks
          </div>
        </div>
      </div>

      {/* Hover enter prompt */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl"
        style={{ background: `${theme.bg}` }}>
        <span className="font-game text-sm font-bold" style={{ color: theme.accent }}>
          ▶ ENTER LEVEL
        </span>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
