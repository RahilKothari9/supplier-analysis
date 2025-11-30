/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ledger: {
          bg: '#F2F0E9',    // Off-white newsprint
          ink: '#1A1A1A',   // Deep black text
          red: '#D9381E',   // Warning crimson
          blue: '#2E5EAA',  // Trust blue
          paper: '#EBE8E0', // Slightly darker section bg
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px #1A1A1A',
      }
    },
  },
  plugins: [],
}