/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        // LoanViz Color System
        // Primary brand colors
        'loanviz-primary': '#3B82F6',    // Blue 500 - primary brand color
        'loanviz-secondary': '#6366F1',  // Indigo 500 - secondary brand color
        'loanviz-accent': '#8B5CF6',     // Violet 500 - accent color
        'loanviz-highlight': '#F59E0B',  // Amber 500 - highlight color

        // Light Mode Colors
        'loanviz-bg-light': '#F0F9FF',       // Sky 50 - light background
        'loanviz-card-light': '#FFFFFF',     // White - card background
        'loanviz-text-light': '#1E293B',     // Slate 800 - primary text
        'loanviz-subtext-light': '#64748B',  // Slate 500 - secondary text
        'loanviz-border-light': '#E2E8F0',   // Slate 200 - borders

        // Dark Mode Colors
        'loanviz-bg-dark': '#0F172A',        // Slate 900 - dark background
        'loanviz-card-dark': '#1E293B',      // Slate 800 - card background
        'loanviz-text-dark': '#F1F5F9',      // Slate 100 - primary text
        'loanviz-subtext-dark': '#94A3B8',   // Slate 400 - secondary text
        'loanviz-border-dark': '#334155',    // Slate 700 - borders

        // Functional colors
        'loanviz-success': '#10B981',        // Emerald 500 - success
        'loanviz-warning': '#F59E0B',        // Amber 500 - warning
        'loanviz-error': '#EF4444',          // Red 500 - error
        'loanviz-info': '#0EA5E9',           // Sky 500 - info

        // Legacy colors (kept for backward compatibility)
        navy: "#001c3d",
        gold: "#ffd700",
        accent: "#0055a4",
        'navy-light': "#002e63",
      },
      // Define direct color values for Tailwind to use with opacity modifiers
      backgroundColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        'card': 'var(--color-card)',
        'background': 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
      },
      textColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        'text': 'var(--color-text)',
        'subtext': 'var(--color-subtext)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
      },
      borderColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        'input': 'var(--color-input)',
        'border': 'var(--color-border)',
        'card': 'var(--color-card)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
      },
      ringColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'neo': '5px 5px 0px #000000',
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'soft-dark': '0 2px 10px rgba(0, 0, 0, 0.2)',
        'inner-light': 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
        'glow-dark': '0 0 15px rgba(129, 140, 248, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      textShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 10px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.5)',
        'neon-blue': '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #3B82F6, 0 0 30px #3B82F6',
        'neon-indigo': '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #6366F1, 0 0 30px #6366F1',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'slide-right': 'slideInRight 0.5s ease-out forwards',
        'slide-left': 'slideInLeft 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'scale': 'scale 0.3s ease-out forwards',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s infinite linear',
        'number-up': 'numberUp 1s ease-out forwards',
        'number-down': 'numberDown 1s ease-out forwards',
        'blob-move': 'blobMove 25s infinite',
        'blob-spin': 'blobSpin 30s infinite linear',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
        scale: {
          '0%': { transform: 'scale(0.95)', opacity: 0.7 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(var(--color-primary-rgb), 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(var(--color-primary-rgb), 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        numberUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        numberDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        blobMove: {
          '0%, 100%': {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'translate(0, 0) rotate(0deg)'
          },
          '33%': {
            borderRadius: '50% 60% 70% 30% / 30% 40% 60% 70%',
            transform: 'translate(5%, 5%) rotate(20deg)'
          },
          '66%': {
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            transform: 'translate(-5%, -5%) rotate(-20deg)'
          },
        },
        blobSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        neonPulse: {
          '0%': {
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 0.5)'
          },
          '100%': {
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 0.8)'
          },
        },
      },
    },
  },
  plugins: [
    require("daisyui"),
    function({ addUtilities, theme }) {
      const textShadows = theme('textShadow', {})
      const textShadowUtilities = Object.entries(textShadows).reduce(
        (utilities, [key, value]) => ({
          ...utilities,
          [`.text-shadow${key === 'DEFAULT' ? '' : `-${key}`}`]: {
            textShadow: value,
          },
        }),
        {}
      )
      addUtilities(textShadowUtilities)
    },
  ],
  daisyui: {
    themes: [
      {
        loanvizLight: {
          "primary": "#3B82F6",
          "secondary": "#6366F1",
          "accent": "#8B5CF6",
          "neutral": "#1E293B",
          "base-100": "#F0F9FF",
          "info": "#0EA5E9",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
        loanvizDark: {
          "primary": "#60A5FA",
          "secondary": "#818CF8",
          "accent": "#A78BFA",
          "neutral": "#F1F5F9",
          "base-100": "#0F172A",
          "info": "#38BDF8",
          "success": "#34D399",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
      },
    ],
    darkTheme: "loanvizDark",
  },
}
