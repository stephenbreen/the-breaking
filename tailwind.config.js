/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // PHB palette mapped onto the existing slate/indigo class names so the
      // app's color tokens flip to a parchment + burgundy theme without
      // touching every component. Low slate numbers (text) are inked browns;
      // high slate numbers (backgrounds) are parchment.
      colors: {
        slate: {
          50:  '#fdf6e3',
          100: '#2a1810', // primary ink — body/heading text
          200: '#3e2c20',
          300: '#4a3520',
          400: '#6b5239',
          500: '#8b7355', // most-muted text
          600: '#a08560',
          700: '#6b5239', // leather — neutral button bg, input border
          800: '#c9a665', // mid parchment — chips, inputs, dividers
          900: '#e8d5a7', // parchment — cards, panels
          950: '#f0e0b8', // page parchment
        },
        indigo: {
          300: '#a02828', // active-turn text — burgundy
          400: '#b8860b', // active-card border — gold
          500: '#a02828',
          600: '#7c1d1d', // primary action — PHB burgundy
          700: '#5c1414',
          800: '#5c1414',
          900: '#e6c270', // active accent block — illuminated gold
          950: '#fbe9b4', // active translucent bg — soft gold
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Bookman Old Style"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
