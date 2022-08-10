/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
}
