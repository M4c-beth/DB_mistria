import type { Config } from 'tailwindcss';

// Palette from .claude/rules/ui-ux.md. Each accent also has an `ink` shade:
// the base tones are too light for small text on parchment (fail WCAG AA),
// so text uses `text-<color>-ink` while tints/borders use the base tone.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'mistria-green': { DEFAULT: '#5C8A47', ink: '#3F6630' },
        'harvest-gold': { DEFAULT: '#D4A03A', ink: '#7A5510' },
        'mistria-blue': { DEFAULT: '#5B8C9E', ink: '#36606F' },
        'wood-brown': { DEFAULT: '#6B4E3D', ink: '#5A4033' },
        'berry-red': { DEFAULT: '#A84242', ink: '#8F3434' },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
