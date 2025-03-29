/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3ff',
          100: '#cce7ff',
          200: '#99cfff',
          300: '#66b7ff',
          400: '#339fff',
          500: '#0087ff', // Primary blue
          600: '#006cd4',
          700: '#0051a3',
          800: '#003672',
          900: '#001b41',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          50: '#eefcfb',
          100: '#d6f5f3',
          200: '#adeae7',
          300: '#84dfd9',
          400: '#5bd4cc',
          500: '#00c1b2', // Teal accent
          600: '#00a99c',
          700: '#007f75',
          800: '#00554e',
          900: '#002a27',
        },
        success: {
          50: '#e6fff4',
          100: '#ccffe9',
          200: '#99ffd3',
          300: '#66ffbd',
          400: '#33ffa7',
          500: '#00d96c', // Green
          600: '#00b359',
          700: '#008c45',
          800: '#006631',
          900: '#00331a',
        },
        warning: {
          50: '#fff8e6',
          100: '#fff1cc',
          200: '#ffe499',
          300: '#ffd666',
          400: '#ffc833',
          500: '#ffb800', // Yellow
          600: '#cc9300',
          700: '#996e00',
          800: '#664a00',
          900: '#332500',
        },
        danger: {
          50: '#ffeeee',
          100: '#ffdede',
          200: '#ffbdbd',
          300: '#ff9c9c',
          400: '#ff7b7b',
          500: '#ff6b6b', // Coral/Red
          600: '#cc5656',
          700: '#994040',
          800: '#662b2b',
          900: '#331515',
        },
        // Meeting UI specific colors
        meeting: {
          background: {
            light: '#f8fafc',
            dark: '#0f172a',
          },
          surface: {
            light: '#ffffff',
            dark: '#1e293b',
          },
          panel: {
            light: '#f1f5f9',
            dark: '#334155',
          },
          control: {
            light: '#e2e8f0',
            dark: '#475569',
          },
        },
        wolt: {
          blue: '#0087ff',
          teal: '#00c1b2',
          coral: '#ff6b6b',
          yellow: '#ffb800',
          green: '#00d96c',
        },
        'wolt-blue': '#0B5CFF',
        'wolt-blue-dark': '#0845BF',
        'wolt-teal': '#00C2B3',
        'wolt-coral': '#FF6B6B',
        'wolt-yellow': '#FFB800',
        'wolt-green': '#00E676',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'wolt': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'wolt-hover': '0 16px 40px rgba(0, 0, 0, 0.12)',
        'meeting': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'meeting-dark': '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'scrolling': 'scrolling 25s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'scrolling': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'theme-gradient': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
