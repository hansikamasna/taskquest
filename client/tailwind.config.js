/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Game theme palette
        quest: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a2e',
          border: '#2a2a4a',
          purple: '#7c3aed',
          'purple-light': '#a855f7',
          blue: '#2563eb',
          'blue-light': '#60a5fa',
          green: '#059669',
          'green-light': '#34d399',
          red: '#dc2626',
          'red-light': '#f87171',
          orange: '#d97706',
          'orange-light': '#fbbf24',
          cyan: '#0891b2',
          'cyan-light': '#22d3ee',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        game: ['Orbitron', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
        'neon-blue': '0 0 20px rgba(37, 99, 235, 0.5)',
        'neon-green': '0 0 20px rgba(5, 150, 105, 0.5)',
        'neon-red': '0 0 20px rgba(220, 38, 38, 0.5)',
        glow: '0 0 40px rgba(124, 58, 237, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'scan-line': 'scanLine 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};
