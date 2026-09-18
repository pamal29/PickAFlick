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
        black:        '#0A0A0F', // true background
        surface:      '#15151F', // cards, navbar, panels
        surfaceHover: '#1F1F2E', // hover state for surfaces
        border:       '#2A2A3D', // subtle dividers

        // Electric blue — primary accent
        accent:        '#3D5AFE',
        accentHover:   '#5C74FF',

        // Vivid amber — secondary accent
        secondary:      '#FFB800',
        secondaryHover: '#FFC933',

        // Text
        textPrimary: '#FFFFFF',
        textSecond:  '#A3A3B8', // secondary labels, meta
        textMuted:   '#5C5C70', // placeholders, disabled

        // Semantic
        danger:      '#FF3B5C',
        dangerHover: '#FF6180',
        success:     '#00E676',
        warning:     '#FFB800',
        star:        '#FFD60A', // ratings
      },
    },
  },
  plugins: [],
};