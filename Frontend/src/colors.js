// PickAFlick — Design Tokens
// Single source of truth for all colors, use these everywhere

export const colors = {
  // Core brand
  black:        '#0a0a0a',   // true background
  surface:      '#111111',   // cards, navbar, panels
  surfaceHover: '#1a1a1a',   // hover state for surfaces
  border:       '#1f1f1f',   // subtle dividers

  // Neon green — primary accent
  neon:         '#39FF14',   // main brand green
  neonDim:      '#39FF1433', // 20% opacity neon (glows, overlays)
  neonHover:    '#5aff3a',   // lighter on hover

  // Text
  textPrimary:  '#ffffff',
  textSecond:   '#a0a0a0',   // secondary labels, meta
  textMuted:    '#4a4a4a',   // placeholders, disabled

  // Semantic
  danger:       '#ff4444',   // logout, remove, errors
  dangerHover:  '#ff6666',
  success:      '#39FF14',   // same as neon — added/confirmed state
  warning:      '#f59e0b',
};

// Tailwind-compatible class helpers (use with template literals)
export const tw = {
  // Surfaces
  bg:        'bg-[#0a0a0a]',
  bgSurface: 'bg-[#111111]',
  bgHover:   'bg-[#1a1a1a]',

  // Text
  textNeon:    'text-[#39FF14]',
  textPrimary: 'text-white',
  textSecond:  'text-[#a0a0a0]',
  textMuted:   'text-[#4a4a4a]',

  // Borders
  border:      'border-[#1f1f1f]',
  borderNeon:  'border-[#39FF14]',

  // Accents
  danger:      'text-[#ff4444]',
};

export default colors;