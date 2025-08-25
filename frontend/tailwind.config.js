/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ainda útil para `dark`, mas usaremos data-theme também
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#336021',
        background: '#F4F2EF',
        dark: '#272525',
        accent: '#E68C3A',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      // Variantes baseadas em data-theme
     addVariant('theme-verde', '&[data-theme="verde"]');
addVariant('theme-laranja', '&[data-theme="laranja"]');
addVariant('theme-magenta', '&[data-theme="magenta"]');
    }
  ]
};