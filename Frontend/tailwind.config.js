/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand
        black:        '#0D0B14', // true background
        surface:      '#16121F', // cards, navbar, panels
        surfaceHover: '#1E1830', // hover state for surfaces
        border:       '#2A2438', // subtle dividers

        // Rose — primary accent
        accent:        '#E8B4B8',
        accentHover:   '#F2C6CA',

        // Lavender — secondary accent
        secondary:    '#C9A9E0',

        // Text
        textPrimary: '#F5F3F7',
        textSecond:  '#A8A2B8', // secondary labels, meta
        textMuted:   '#6B6580', // placeholders, disabled

        // Semantic
        danger:      '#ff4444',
        dangerHover: '#ff6666',
        success:     '#8FD9A8',
        warning:     '#f59e0b',
        star:        '#F0C674', // ratings
      },
    },
  },
  plugins: [],
};
