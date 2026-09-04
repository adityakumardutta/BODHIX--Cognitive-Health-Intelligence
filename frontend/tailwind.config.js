/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          2: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        },
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        default: 'rgb(var(--border-rgb) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          2: 'rgb(var(--accent2-rgb) / <alpha-value>)',
        },
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
        danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
        clinical: {
          50: '#f2f7f7', 100: '#dcebea', 200: '#b9d7d5', 300: '#8fbdba',
          400: '#5f9d99', 500: '#3f8480', 600: '#2f6a67', 700: '#275653',
          800: '#224645', 900: '#1e3a39',
        },
        concern: {
          50: '#fdf3ee', 100: '#fbe2d5', 500: '#c96a3e',
          600: '#a8532e', 700: '#874025',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', '"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        surface: 'var(--shadow)',
        'surface-sm': 'var(--shadow-sm)',
        'surface-md': 'var(--shadow-md)',
        glow: 'var(--shadow-glow)',
        accent: 'var(--shadow-accent)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
