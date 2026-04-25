/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'rgb(var(--app-bg) / <alpha-value>)',
          surface: 'rgb(var(--app-surface) / <alpha-value>)',
          elev: 'rgb(var(--app-elev) / <alpha-value>)',
          'elev-2': 'rgb(var(--app-elev-2) / <alpha-value>)',
          fg: 'rgb(var(--app-fg) / <alpha-value>)',
          'fg-2': 'rgb(var(--app-fg-2) / <alpha-value>)',
          muted: 'rgb(var(--app-muted) / <alpha-value>)',
          subtle: 'rgb(var(--app-subtle) / <alpha-value>)',
          line: 'rgb(var(--app-line) / <alpha-value>)',
          'line-2': 'rgb(var(--app-line-2) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
          fg: 'rgb(var(--accent-fg) / <alpha-value>)',
          ring: 'rgb(var(--accent-ring) / <alpha-value>)',
        },
        pc: {
          soft: 'rgb(var(--pc-soft) / <alpha-value>)',
          fg: 'rgb(var(--pc-fg) / <alpha-value>)',
          solid: 'rgb(var(--pc-solid) / <alpha-value>)',
        },
        npc: {
          soft: 'rgb(var(--npc-soft) / <alpha-value>)',
          fg: 'rgb(var(--npc-fg) / <alpha-value>)',
          solid: 'rgb(var(--npc-solid) / <alpha-value>)',
        },
        condition: {
          soft: 'rgb(var(--condition-soft) / <alpha-value>)',
          fg: 'rgb(var(--condition-fg) / <alpha-value>)',
          solid: 'rgb(var(--condition-solid) / <alpha-value>)',
        },
        strategy: {
          soft: 'rgb(var(--strategy-soft) / <alpha-value>)',
          fg: 'rgb(var(--strategy-fg) / <alpha-value>)',
          solid: 'rgb(var(--strategy-solid) / <alpha-value>)',
        },
        warn: {
          DEFAULT: 'rgb(var(--warn) / <alpha-value>)',
          soft: 'rgb(var(--warn-soft) / <alpha-value>)',
          fg: 'rgb(var(--warn-fg) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          soft: 'rgb(var(--danger-soft) / <alpha-value>)',
        },
        'hp-good': 'rgb(var(--hp-good) / <alpha-value>)',
        'hp-warn': 'rgb(var(--hp-warn) / <alpha-value>)',
        'hp-bad': 'rgb(var(--hp-bad) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
