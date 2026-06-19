import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animated particle background component
const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: ['#7c3aed', '#2563eb', '#059669', '#0891b2'][Math.floor(Math.random() * 4)],
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw connections between nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-quest-bg relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated particle background */}
      <ParticleField />

      {/* Grid overlay */}
      <div className="fixed inset-0 grid-bg opacity-30 z-0" />

      {/* Radial glow at center */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)' }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-quest-purple/40 bg-quest-purple/10 text-quest-purple-light text-sm font-body mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-quest-green-light animate-pulse" />
          MULTIPLAYER MODE ACTIVE
        </motion.div>

        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        >
          <h1 className="font-game text-6xl md:text-8xl font-black text-glow-purple mb-2"
            style={{ color: '#a855f7' }}>
            TASK
          </h1>
          <h1 className="font-game text-6xl md:text-8xl font-black text-glow-blue mb-6"
            style={{ color: '#60a5fa' }}>
            QUEST
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-body text-xl md:text-2xl text-quest-muted mb-12 max-w-md mx-auto"
        >
          Conquer your projects. <span className="text-quest-purple-light">Level up</span> your team.
          Build legendary products.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-8 justify-center mb-12 text-center"
        >
          {[
            { label: 'MISSIONS', value: '∞' },
            { label: 'PLAYERS', value: '∞' },
            { label: 'LEVELS', value: '∞' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-game text-2xl text-quest-purple-light">{stat.value}</div>
              <div className="font-body text-xs text-quest-muted tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124, 58, 237, 0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-quest-purple hover:bg-quest-purple-light rounded-xl font-game text-white font-bold tracking-widest transition-all border border-quest-purple-light/30"
          >
            ▶ START GAME
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-transparent hover:bg-quest-surface rounded-xl font-game text-quest-purple-light font-bold tracking-widest transition-all border border-quest-purple/50"
          >
            CONTINUE
          </motion.button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap gap-3 justify-center mt-16"
        >
          {['Kanban Board', 'Real-Time Sync', 'Team Co-op', 'Drag & Drop', 'XP System'].map((f) => (
            <span key={f} className="px-3 py-1 rounded-full text-xs font-body text-quest-muted border border-quest-border bg-quest-surface/50">
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom scan line decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-quest-purple to-transparent opacity-50" />
    </div>
  );
};

export default Landing;
