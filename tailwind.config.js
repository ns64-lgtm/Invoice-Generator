/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#1a1a2e',
        paper: '#faf9f6',
        accent: '#e8722a',
        muted: '#8b8b9e',
        line: '#e5e4df',
        surface: '#f2f1ec',
      },
    },
  },
  plugins: [],
}
