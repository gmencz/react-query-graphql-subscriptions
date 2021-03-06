const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontSize: {
        tiny: '.7rem',
      },
      width: {
        sidebar: '240px',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: colors.cyan,
      },
      transitionTimingFunction: {
        tooltip: 'cubic-bezier(0,.68,.52,.6)',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['group-hover', 'disabled'],
      pointerEvents: ['group-hover'],
      translate: ['group-hover'],
      width: ['group-hover'],
    },
  },
  plugins: [],
}
