import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, Player! 🎮');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-quest-bg grid-bg flex items-center justify-center px-4">
      {/* Glow effect */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.1) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-game text-4xl font-black text-glow-purple" style={{ color: '#a855f7' }}>
              TASK<span style={{ color: '#60a5fa' }}>QUEST</span>
            </h1>
          </Link>
          <p className="font-body text-quest-muted mt-2 text-lg">Player Login</p>
        </div>

        {/* Card */}
        <div className="card-glass rounded-2xl p-8 border-glow-blue">
          <h2 className="font-game text-xl text-quest-text mb-6 tracking-wide">CONTINUE SESSION</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-quest-muted text-sm mb-2 tracking-widest">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="player@example.com"
                className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-blue transition-colors"
              />
            </div>

            <div>
              <label className="block font-body text-quest-muted text-sm mb-2 tracking-widest">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-body text-quest-text placeholder-quest-muted/50 focus:outline-none focus:border-quest-blue transition-colors"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-quest-blue hover:bg-quest-blue-light rounded-xl font-game text-white font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}
            >
              {loading ? 'LOADING...' : '▶ LOGIN'}
            </motion.button>
          </form>

          <p className="text-center font-body text-quest-muted mt-6">
            New player?{' '}
            <Link to="/register" className="text-quest-purple-light hover:text-quest-purple font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
