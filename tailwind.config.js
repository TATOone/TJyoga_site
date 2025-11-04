/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'terracotta': '#C85C3C',
        'golden-sandy': '#D4A574',
        'olive-green': '#8B956D',
        'cream': '#F5EFE7',
        'light-sandy': '#EDE3D5',
        'light-olive': '#E8EBE0',
        'dark-brown': '#3D3229',
        'light-text': '#FFFFFF',
        'gray-brown': '#736B5E',
      },
    },
  },
  plugins: [],
}