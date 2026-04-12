/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
       
primary: '#16A34A',
secondary: '#1E3A8A',
accent: '#22C55E',
background: '#F8FAFC',
text: '#1F2937'
      },
    },
  },
  plugins: [],
}