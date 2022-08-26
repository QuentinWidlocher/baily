/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#9333ea",
          "primary-content": "#fcfcfc",
          "secondary": "#3b82f6",
          "accent": "#ec4899",
          "neutral": "#4b5563",
          "base-100": "#fcfcfc",
          "base-200": "#efecf0",
          "base-300": "#DCD9DD",
          "info": "#22d3ee",
          "success": "#34d399",
          "warning": "#facc15",
          "error": "#f43f5e",
        },
      },
      {
        dark: {
          "primary": "#a855f7",
          "secondary": "#60a5fa",
          "accent": "#f472b6",
          "neutral": "#9ca3af",
          "base-100": "#3b4455",
          "info": "#67e8f9",
          "success": "#6ee7b7",
          "warning": "#fde047",
          "error": "#fb7185",
        },
      },
    ],
  },
  plugins: [
    require('daisyui')
  ],
}
