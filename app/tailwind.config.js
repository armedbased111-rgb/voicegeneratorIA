/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        surface: '#F3F3F3',
        border: '#E0E0E0',
        muted: '#A0A0A0',
        ink: '#111111',
      }
    }
  },
  plugins: []
}
