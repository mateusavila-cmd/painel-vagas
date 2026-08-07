/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta extraída da marca HD Serviços (magenta/roxo do wordmark "HD")
        brand: {
          50: '#fdf2f9',
          100: '#f9e1f2',
          200: '#f2c0e2',
          300: '#e68fca',
          400: '#d756ae',
          500: '#c32c94',
          600: '#9e2477',
          700: '#7e2060',
          800: '#631c4d',
          900: '#4e183d',
          950: '#301227',
        },
        // Gradiente do ícone da marca (coral -> magenta -> índigo), para acentos e heros
        sunset: {
          300: '#e2788f',
          400: '#d6517e',
          500: '#c4317a',
          600: '#9d2a7b',
          700: '#7a297a',
          800: '#512862',
          900: '#39234d',
        },
      },
      // Tipografia de display (Sora, injetada via next/font como --font-display)
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Sombras de conversão: glow âmbar em camadas para CTAs e cards interativos
      boxShadow: {
        cta: '0 10px 40px -10px rgba(251, 191, 36, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'cta-lg': '0 18px 60px -12px rgba(249, 115, 22, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'glow-amber': '0 0 44px -12px rgba(251, 191, 36, 0.4)',
        'glow-blue': '0 0 90px -20px rgba(59, 130, 246, 0.5)',
        'card-hover': '0 24px 60px -18px rgba(2, 6, 23, 0.9)',
      },
      keyframes: {
        // Entrada suave de elementos do hero (fade + subida)
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Flutuação lenta dos orbes de luz do fundo atmosférico
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(12px, -24px, 0)' },
        },
        // Deriva continental das auroras do fundo imersivo (trajetória elíptica)
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(40px, -30px, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-30px, 24px, 0) scale(0.95)' },
        },
        // Pulso de glow dourado nos CTAs de conversão
        'cta-glow': {
          '0%, 100%': { boxShadow: '0 0 18px 0 rgba(251, 191, 36, 0.35), 0 0 50px -8px rgba(251, 146, 60, 0.30)' },
          '50%': { boxShadow: '0 0 30px 4px rgba(251, 191, 36, 0.55), 0 0 80px -4px rgba(251, 146, 60, 0.45)' },
        },
        // Halo pulsante atrás do CTA primário (escala lenta e desvanecimento)
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.45' },
          '70%, 100%': { transform: 'scale(1.28)', opacity: '0' },
        },
        // Flutuação delicada de elementos decorativos (sparkles, ícones soltos)
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(8deg)' },
        },
        // Entrada do modal de candidatura (bottom sheet no mobile)
        'modal-in': {
          '0%': { opacity: '0', transform: 'translateY(48px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'drift-a': 'aurora-drift 18s ease-in-out infinite',
        'drift-b': 'aurora-drift 24s ease-in-out infinite reverse',
        'cta-glow': 'cta-glow 2.4s ease-in-out infinite',
        'ping-slow': 'ping-slow 2.6s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-gentle': 'float-gentle 7s ease-in-out infinite',
        'modal-in': 'modal-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
