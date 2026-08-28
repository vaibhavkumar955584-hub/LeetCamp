import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crt: {
          bg: '#0b0f0a',
          card: '#0f170e',
          cardHover: '#142013',
          green: '#33ff66',
          greenDim: '#62ad6a',     /* WCAG AA Compliant: 7.09:1 contrast */
          greenMuted: '#72c07a',   /* WCAG AAA Compliant: 8.77:1 contrast */
          greenDark: '#162e19',
          border: '#1a2e1a',
          borderBright: '#2d4f2d',
          amber: '#ffb000',        /* WCAG AAA Compliant: 10.55:1 contrast */
          red: '#ff3b3b',          /* WCAG AA Compliant: 5.47:1 contrast */
        },
      },
      fontFamily: {
        arcade: ['var(--font-arcade)', 'monospace'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
