/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}'
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E9DBB',
          light: '#4DB8D6',
          dark: '#1F7A94',
        },
        secondary: {
          DEFAULT: '#8B5FBF',
          light: '#A77DD6',
          dark: '#6B4596',
        },
        accent: {
          mint: '#A3E4D7',
          orange: '#FFB347',
          pink: '#F8B4D9',
        },
        neutral: {
          100: '#F5F7FA',
          200: '#E8ECF0',
          300: '#D1D8E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A202C',
          900: '#171923',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
