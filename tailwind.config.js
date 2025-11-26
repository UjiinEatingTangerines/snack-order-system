/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif'
        ],
      },
      colors: {
        primary: {
          50: '#FFF5ED',
          100: '#FFE8D5',
          200: '#FFCDAA',
          300: '#FFAA74',
          400: '#FF7A3C',
          500: '#FF5516',
          600: '#F0380C',
          700: '#C7260D',
          800: '#9E2213',
          900: '#7F1F13',
        },
        accent: {
          50: '#FFF9F5',
          100: '#FFF0E6',
          200: '#FFE0CC',
          300: '#FFC8A3',
          400: '#FFA570',
          500: '#FF8247',
          600: '#FF6B2C',
          700: '#E85A1F',
          800: '#C24B18',
          900: '#9D3D14',
        },
        cream: {
          50: '#FFFBF5',
          100: '#FFF6E9',
          200: '#FFEDD3',
          300: '#FFE3BD',
          400: '#FFD9A7',
          500: '#FFCF91',
          600: '#E6BB83',
          700: '#CCA774',
          800: '#B39366',
          900: '#997F58',
        }
      },
    },
  },
  plugins: [],
}

