/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#101828',
        ember: '#c2410c',
        moss: '#466647',
        steel: '#335c67',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
