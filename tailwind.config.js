/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FDF8EF',
        'background-dark': '#1C1712',
        surface: '#FFFFFF',
        'surface-dark': '#282019',
        primary: '#D99113',
        'primary-dark': '#B96E0B',
        'primary-soft': '#F7E5BD',
        text: '#382D23',
        'text-dark': '#F9F1E5',
        'text-muted': '#887C71',
        'text-muted-dark': '#B5A99B',
        border: '#E9DECE',
        'border-dark': '#4A3D32',
        success: '#3B7B5D',
        danger: '#B7473A',
      },
      fontFamily: {
        serif: ['Georgia'],
      },
    },
  },
  plugins: [],
};
