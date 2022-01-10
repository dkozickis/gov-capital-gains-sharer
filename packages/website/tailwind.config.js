const { join } = require('path');

module.exports = {
  content: [join(__dirname, 'pages/**/*.{js,ts,jsx,tsx}')],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
