/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
    colors: {
      transparent: 'transparent',
      lightmode_bg: '#fafafa',
      darkmode_bg: '#09090b',
      primary_light: '#51aeb1',
      primary_dark: '#1b4433'
    },
  },
  plugins: [],
  darkMode: 'class',
}

