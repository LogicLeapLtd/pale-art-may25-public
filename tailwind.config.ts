import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest': {
          50: '#f8faf8',
          100: '#f0f4f0',
          200: '#e1e8e1',
          300: '#c9d5c9',
          400: '#a8bca8',
          500: '#849984',
          600: '#6b8a6b',
          700: '#516951',
          800: '#3d4f3d',
          900: '#2a352a',
          950: '#1a231a',
        },
        'gold': {
          50: '#fdfcf9',
          100: '#faf7f0',
          200: '#f4eddc',
          300: '#eadfc0',
          400: '#dcc896',
          500: '#caa96b',
          600: '#b8944d',
          700: '#9a7b3f',
          800: '#7d6237',
          900: '#675130',
          950: '#3a2d18',
        },
        'cream': {
          50: '#fefdfb',
          100: '#fefcf7',
          200: '#fcf7ea',
          300: '#f8f0d6',
          400: '#f2e4b8',
          500: '#ead394',
          600: '#ddc070',
          700: '#c9a858',
          800: '#a6894b',
          900: '#877040',
          950: '#4a3d21',
        },
        'sage': {
          50: '#f9faf9',
          100: '#f2f5f2',
          200: '#e6eae6',
          300: '#d1d9d1',
          400: '#b3c2b3',
          500: '#94a794',
          600: '#7a8c7a',
          700: '#647164',
          800: '#525a52',
          900: '#434a43',
          950: '#232823',
        }
      },
      fontFamily: {
        'display': ['Francie Serif', 'Georgia', 'serif'],
        'body': ['Crimson Text', 'Georgia', 'serif'],
        'accent': ['Francie Serif', 'Georgia', 'serif'],
        'elegant': ['Francie Serif', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      letterSpacing: {
        'widest': '0.3em',
        'ultra-wide': '0.5em',
      },
      lineHeight: {
        'extra-loose': '2.2',
        'ultra-loose': '2.5',
      },
      boxShadow: {
        'elegant': '0 8px 32px rgba(26, 35, 26, 0.08)',
        'luxe': '0 16px 64px rgba(26, 35, 26, 0.12)',
        'inset-luxe': 'inset 0 1px 3px rgba(26, 35, 26, 0.06)',
      },
      backgroundImage: {
        'grain': "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" fill=\"%23000\" opacity=\"0.02\"><circle cx=\"4\" cy=\"4\" r=\"1\"/><circle cx=\"12\" cy=\"8\" r=\"1\"/><circle cx=\"20\" cy=\"4\" r=\"1\"/><circle cx=\"28\" cy=\"8\" r=\"1\"/><circle cx=\"8\" cy=\"16\" r=\"1\"/><circle cx=\"16\" cy=\"12\" r=\"1\"/><circle cx=\"24\" cy=\"16\" r=\"1\"/><circle cx=\"4\" cy=\"24\" r=\"1\"/><circle cx=\"12\" cy=\"28\" r=\"1\"/><circle cx=\"20\" cy=\"24\" r=\"1\"/><circle cx=\"28\" cy=\"28\" r=\"1\"/></svg>')",
        'leaf-pattern': "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"%23516951\" opacity=\"0.03\"><path d=\"M20 20c10-10 30-10 40 0s10 30 0 40-30 10-40 0-10-30 0-40z\"/><path d=\"M60 60c10-10 30-10 40 0s10 30 0 40-30 10-40 0-10-30 0-40z\"/></svg>')",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in': 'fadeIn 1s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config