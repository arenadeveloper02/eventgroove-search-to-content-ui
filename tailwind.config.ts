import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effaf7',
          100: '#d6f2eb',
          500: '#0f9d8c',
          600: '#0c8578',
          700: '#0a6b61',
        },
        navy: '#12304a',
      },
    },
  },
  plugins: [typography],
};

export default config;
