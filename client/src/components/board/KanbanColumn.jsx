import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';

const columnConfig = {
  todo:     { label: 'TO DO',       icon: '📋', color: '#60a5fa', glow: 'rgba(37,99,235,0.3)'  },
  progress: { label: 'IN PROGRESS', icon: '⚔️', color: '#fbbf24', glow: 'rgba(217,119,6,0.3)'  },
  review:   { label: 'REVIEW',      icon: '🔍', color: '#a855f7', glow: 'rgba(124,58,237,0.3)' },
  done:     { label: 'DONE',        icon: '✅', color: '#34d399', glow: 'rgba(5,150,105,0.3)'  },
};

const KanbanColumn = ({ columnId, tasks, onAddTask, onDeleteTask, onEditTask, onTaskClaimed }) => {
  const config = columnConfig[columnId];
  const lockedCount = tasks.filter(t => t.isLocked).length;
  const claimedCount = tasks.filter(t => t.claimedBy && !t.isLocked).length;

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <h3 className="font-game text-sm font-bold tracking-widest" style={{ color: config.color }}>
            {config.label}
          </h3>
          <span className="w-5 h-5 rounded-full flex items-center justify-center font-game text-xs font-bold"
            style={{ background: `${config.color}20`, color: config.color }}>
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lock count indicator */}
          {lockedCount > 0 && (
            <span className="font-body text-xs text-quest-muted" title={`${lockedCount} locked`}>
              🔒{lockedCount}
            </span>
          )}
          {/* Claimed count */}
          {claimedCount > 0 && columnId !== 'done' && (
            <span className="font-body text-xs text-quest-purple-light" title={`${claimedCount} claimed`}>
              ⚔️{claimedCount}
            </span>
          )}
          {columnId === 'todo' && (
            <button onClick={onAddTask}
              className="text-quest-muted hover:text-quest-text transition-colors text-xl leading-none">
              +
            </button>
          )}
        </div>
      </motion.div>

      {/* Droppable zone */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps}
            className="flex-1 min-h-32 rounded-xl p-3 transition-all duration-200 space-y-3"
            style={{
              background: snapshot.isDraggingOver
                ? `linear-gradient(135deg, rgba(26,26,46,0.9) 0%, ${config.glow.replace('0.3','0.12')} 100%)`
                : 'rgba(18,18,26,0.6)',
              border: `1px solid ${snapshot.isDraggingOver ? config.color + '60' : 'rgba(42,42,74,0.5)'}`,
              boxShadow: snapshot.isDraggingOver ? `0 0 20px ${config.glow}` : 'none',
            }}>

            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index}
                onDelete={onDeleteTask} onEdit={onEditTask} onClaimed={onTaskClaimed} />
            ))}

            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-20 flex items-center justify-center">
                <p className="font-body text-xs text-quest-muted/40 text-center">
                  {columnId === 'todo' ? 'Create missions above' : 'Drop missions here'}
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
