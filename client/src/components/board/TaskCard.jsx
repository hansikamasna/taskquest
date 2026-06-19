import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { claimTask, deleteTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const priorityConfig = {
  low:      { label: 'LOW',  color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  medium:   { label: 'MED',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  high:     { label: 'HIGH', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  critical: { label: 'CRIT', color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
};

// Points per priority so user knows what they'd earn
const pointsPreview = { low: 50, medium: 100, high: 150, critical: 200 };

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const diff = d - new Date();
  return {
    text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: diff < 0,
    isUrgent: diff < 86400000 * 2,
  };
};

const TaskCard = ({ task, index, onDelete, onEdit, onClaimed }) => {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [hovered, setHovered] = useState(false);

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const dueDate = formatDate(task.dueDate);
  const isLocked = task.isLocked;
  const isClaimed = !!task.claimedBy;
  const isClaimedByMe = task.claimedBy?._id === user?._id || task.claimedBy === user?._id;
  const isDone = task.status === 'done';

  // A locked task cannot be dragged at all
  const isDragDisabled = isLocked || isDone;

  const handleClaim = async (e) => {
    e.stopPropagation();
    if (isLocked) return toast.error('🔒 Complete dependencies first!');
    if (isClaimed) return toast.error('Already claimed by ' + task.claimedBy?.name);
    setClaiming(true);
    try {
      const { data } = await claimTask(task._id);
      toast.success(`⚔️ Mission claimed! +${pointsPreview[task.priority]} pts available`);
      onClaimed(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim');
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this mission?')) return;
    try {
      await deleteTask(task._id);
      onDelete(task._id);
      toast.success('Mission deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Draggable draggableId={task._id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => !isLocked && onEdit(task)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`rounded-xl p-4 transition-all relative ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
          style={{
            ...provided.draggableProps.style,
            background: isLocked
              ? 'rgba(15,15,25,0.7)'
              : snapshot.isDragging
              ? 'rgba(124,58,237,0.25)'
              : 'rgba(26,26,46,0.85)',
            border: isLocked
              ? '1px solid rgba(42,42,74,0.4)'
              : isClaimed && isClaimedByMe
              ? '1px solid rgba(124,58,237,0.6)'
              : isClaimed
              ? '1px solid rgba(37,99,235,0.5)'
              : '1px solid rgba(42,42,74,0.7)',
            boxShadow: snapshot.isDragging
              ? '0 10px 30px rgba(124,58,237,0.4)'
              : isClaimedByMe
              ? '0 0 12px rgba(124,58,237,0.2)'
              : 'none',
            opacity: isLocked ? 0.6 : 1,
          }}
        >
          {/* ── LOCKED OVERLAY ── */}
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10 bg-black/30">
              <span className="text-3xl mb-1">🔒</span>
              <span className="font-game text-xs text-quest-muted text-center px-2">
                Complete dependencies first
              </span>
              {/* Show what's blocking */}
              {task.dependencies?.length > 0 && (
                <div className="mt-2 px-2 text-center">
                  {task.dependencies.filter(d => d.status !== 'done').map(d => (
                    <div key={d._id} className="text-xs text-quest-red-light font-body">
                      ✗ {d.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CARD CONTENT ── */}
          <div className={isLocked ? 'blur-[1px]' : ''}>
            {/* Top row: priority + points preview + delete */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-game text-xs font-bold"
                  style={{ color: priority.color, background: priority.bg }}>
                  {priority.label}
                </span>
                {/* Points preview badge */}
                {!isDone && !isLocked && (
                  <span className="font-game text-xs text-quest-orange-light opacity-70">
                    +{pointsPreview[task.priority]}pts
                  </span>
                )}
                {/* Points awarded badge when done */}
                {isDone && task.pointsAwarded > 0 && (
                  <span className="font-game text-xs text-quest-green-light">
                    +{task.pointsAwarded}pts ✓
                  </span>
                )}
              </div>
              {hovered && !isLocked && (
                <button onClick={handleDelete}
                  className="text-quest-muted hover:text-quest-red-light transition-colors text-sm">
                  ✕
                </button>
              )}
            </div>

            {/* Title */}
            <h4 className="font-body text-quest-text font-semibold text-sm mb-1 leading-snug">
              {task.title}
            </h4>

            {/* Description */}
            {task.description && (
              <p className="font-body text-quest-muted text-xs mb-3 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Dependencies info (when not locked) */}
            {!isLocked && task.dependencies?.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {task.dependencies.map(d => (
                  <span key={d._id || d}
                    className="text-xs px-1.5 py-0.5 rounded font-body"
                    style={{
                      background: d.status === 'done' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                      color: d.status === 'done' ? '#34d399' : '#f87171',
                    }}>
                    {d.status === 'done' ? '✓' : '○'} {d.title || 'dep'}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-3">
              {/* Claimer info / Claim button */}
              {isClaimed ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-game font-bold text-white"
                    style={{ backgroundColor: task.claimedBy?.avatarColor || '#7c3aed' }}>
                    {task.claimedBy?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-body text-xs truncate max-w-20"
                    style={{ color: isClaimedByMe ? '#a855f7' : '#94a3b8' }}>
                    {isClaimedByMe ? 'You' : task.claimedBy?.name}
                  </span>
                </div>
              ) : !isDone && !isLocked ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  disabled={claiming}
                  className="px-3 py-1 rounded-lg font-game text-xs font-bold transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(124,58,237,0.2)',
                    border: '1px solid rgba(124,58,237,0.5)',
                    color: '#a855f7',
                    boxShadow: '0 0 8px rgba(124,58,237,0.2)',
                  }}
                >
                  {claiming ? '...' : '⚔️ CLAIM'}
                </motion.button>
              ) : (
                <span className="text-xs text-quest-muted font-body">Unclaimed</span>
              )}

              {/* Due date */}
              {dueDate && (
                <span className={`font-body text-xs px-2 py-0.5 rounded ${
                  dueDate.isOverdue ? 'text-quest-red-light bg-red-900/20'
                  : dueDate.isUrgent ? 'text-quest-orange-light bg-orange-900/20'
                  : 'text-quest-muted bg-quest-bg'}`}>
                  {dueDate.isOverdue ? '⚠ ' : ''}{dueDate.text}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
