/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'classic-grey': '#D4D0C8',
        'classic-blue': '#000080',
        'classic-aero': '#A6CAF0',
        'classic-header': '#E0E0E0',
        'gjc-green': '#00401A',
        'gjc-gold': '#C5A059',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'bevel-raised': '2px 2px 0px #FFFFFF inset, -2px -2px 0px #808080 inset',
        'bevel-sunken': '2px 2px 0px #808080 inset, -2px -2px 0px #FFFFFF inset',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
