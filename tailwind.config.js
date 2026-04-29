export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1B4FD8',
          800: '#1E40AF',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'fab': '0 4px 16px rgba(27,79,216,0.4)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    }
  },
  plugins: [],
}
