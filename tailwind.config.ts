import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:          '#080808',
        'bg-2':      '#0d0d0d',
        card:        '#111111',
        'card-2':    '#161616',
        border:      'rgba(255,255,255,0.07)',
        'border-2':  'rgba(255,255,255,0.12)',
        red:         '#E03030',
        'red-dim':   'rgba(224,48,48,0.12)',
        'red-glow':  'rgba(224,48,48,0.22)',
        t1:          '#F0F0F0',
        t2:          '#888888',
        t3:          '#444444',
      },
      fontFamily: {
        sans:    ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'blink':        'blink 2s ease-in-out infinite',
        'pulse-red':    'pulseRed 3s ease-in-out infinite',
        'fade-up':      'fadeUp 0.5s ease both',
      },
      keyframes: {
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        blink:    { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        fadeUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseRed: { '0%,100%': { boxShadow: '0 0 0 0 rgba(224,48,48,0)' }, '50%': { boxShadow: '0 0 20px 4px rgba(224,48,48,0.2)' } },
      },
    },
  },
  plugins: [],
}

export default config
