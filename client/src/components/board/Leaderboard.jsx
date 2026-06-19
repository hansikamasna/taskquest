import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const rankColors = ['#fbbf24', '#94a3b8', '#d97706', '#a855f7', '#60a5fa'];
const rankLabels = ['👑', '🥈', '🥉', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const Leaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(({ data }) => setPlayers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-quest-surface border border-quest-border p-6">
        <div className="h-4 bg-quest-border rounded animate-pulse mb-4 w-32" />
        {[1,2,3].map(i => <div key={i} className="h-12 bg-quest-border rounded-xl animate-pulse mb-2" />)}
      </div>
    );
  }

  const myRank = players.findIndex(p => p._id === user?._id) + 1;

  return (
    <div className="rounded-2xl bg-quest-surface border border-quest-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-quest-border flex items-center justify-between">
        <div>
          <h2 className="font-game text-lg text-quest-text">🏆 LEADERBOARD</h2>
          <p className="font-body text-xs text-quest-muted mt-0.5">Top players by points this season</p>
        </div>
        {myRank > 0 && (
          <div className="text-right">
            <div className="font-game text-sm text-quest-purple-light">YOUR RANK</div>
            <div className="font-game text-2xl" style={{ color: rankColors[myRank - 1] || '#60a5fa' }}>
              #{myRank}
            </div>
          </div>
        )}
      </div>

      {/* Player list */}
      <div className="p-4 space-y-2">
        {players.length === 0 ? (
          <p className="font-body text-quest-muted text-sm text-center py-4">
            No players yet. Complete missions to rank up!
          </p>
        ) : (
          players.map((player, index) => {
            const isMe = player._id === user?._id;
            const rank = index + 1;
            return (
              <motion.div
                key={player._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isMe ? 'rgba(124,58,237,0.15)' : 'rgba(26,26,46,0.5)',
                  border: `1px solid ${isMe ? 'rgba(124,58,237,0.4)' : 'rgba(42,42,74,0.3)'}`,
                  boxShadow: isMe ? '0 0 12px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                {/* Rank */}
                <div className="w-8 text-center font-game text-lg flex-shrink-0">
                  {rankLabels[index] || `#${rank}`}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-game font-bold text-white flex-shrink-0"
                  style={{
                    backgroundColor: player.avatarColor || '#7c3aed',
                    boxShadow: isMe ? `0 0 8px ${player.avatarColor}80` : 'none',
                  }}>
                  {player.name?.[0]?.toUpperCase()}
                </div>

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-sm truncate"
                      style={{ color: isMe ? '#a855f7' : '#e2e8f0' }}>
                      {player.name}
                      {isMe && <span className="ml-1 text-xs">(you)</span>}
                    </span>
                    {/* Streak badge */}
                    {player.streak > 1 && (
                      <span className="text-xs font-body text-quest-orange-light flex-shrink-0">
                        🔥{player.streak}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="font-body text-xs text-quest-muted">
                      ✅ {player.tasksCompleted} done
                    </span>
                    <span className="font-body text-xs text-quest-muted">
                      ⚔️ {player.tasksClaimed} claimed
                    </span>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <div className="font-game text-base font-bold"
                    style={{ color: rankColors[index] || '#60a5fa' }}>
                    {(player.totalPoints || 0).toLocaleString()}
                  </div>
                  <div className="font-body text-xs text-quest-muted">pts</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Points guide */}
      <div className="px-5 py-3 border-t border-quest-border">
        <p className="font-body text-xs text-quest-muted text-center">
          Low: 50pts · Med: 100pts · High: 150pts · Crit: 200pts · On-time bonus: +50pts
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
