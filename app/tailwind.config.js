/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        mono:  ['Geist Mono', 'monospace'],
      },
      colors: {
        // RGB tuple format — required for Tailwind opacity modifiers (text-ink/40, bg-ink/5, etc.)
        bg:      'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border:  'rgb(var(--border) / <alpha-value>)',
        muted:   'rgb(var(--muted) / <alpha-value>)',
        ink:     'rgb(var(--ink) / <alpha-value>)',
      }
    }
  },
  plugins: []
}
