/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lcpm-orange': '#F5A623',
        'lcpm-blue': '#0077B5',
        'lcpm-yellow': '#FFCC00',
        'lcpm-dark': '#2C3E50',
      },
      fontFamily: {
        'sign': ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
