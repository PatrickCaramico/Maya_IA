/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0B0A14',
        nebula: {
          DEFAULT: '#171325',
          elevated: '#1e1930',
          hover: '#211c34',
          border: '#2A2740',
        },
        pulse: {
          DEFAULT: '#8B5CF6',
          hover: '#7C4DEF',
          'glow': 'rgba(139, 92, 246, 0.25)',
        },
        signal: {
          DEFAULT: '#2EE6D6',
          hover: '#26c4b7',
        },
        alert: '#FF3D81',
        frost: '#F5F3FF',
        secondary: '#A9A6C4',
        muted: '#6E6B85',
        success: '#34D399',
        warning: '#FBBF24',
      },
      fontFamily: {
        heading: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        body: ["'Inter'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        'glow-pulse': '0 0 15px rgba(139, 92, 246, 0.35)',
        'glow-signal': '0 0 15px rgba(46, 230, 214, 0.35)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'spin-slow': 'spinSlow 8s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)' },
          '50%': { boxShadow: '0 0 22px rgba(139, 92, 246, 0.8)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
