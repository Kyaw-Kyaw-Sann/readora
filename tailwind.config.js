/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FDF8EF',
        surface: '#FFFFFF',
        primary: '#D99113',
        'primary-dark': '#B96E0B',
        'primary-soft': '#F7E5BD',
        text: '#382D23',
        'text-muted': '#887C71',
        border: '#E9DECE',
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
