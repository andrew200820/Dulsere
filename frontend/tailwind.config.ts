import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca Dulseré (del Manual de Marca 2026)
        brand: {
          crimson: '#890A0A',
          black:   '#000000',
          cream:   '#FDF1E2',
          peach:   '#FFDCB1',
        },
        primary: {
          950: '#3D0404',
          900: '#5C0606',
          800: '#890A0A',
          700: '#A01010',
          600: '#B91C1C',
          100: '#FEE2E2',
          50:  '#FFF5F5',
        },
        neutral: {
          50:  '#FAF7F4',
          100: '#F0EAE4',
          200: '#E0D6CE',
          300: '#C8BDB5',
          400: '#A89890',
          500: '#887870',
          600: '#685850',
          700: '#4A3830',
          800: '#2E201A',
          900: '#181008',
        },
        success: {
          700: '#1D5C3A',
          600: '#2D7A4F',
          500: '#3A9E65',
          100: '#D4EDDA',
          50:  '#EDFAF3',
        },
        warning: {
          700: '#92400E',
          600: '#B5621A',
          500: '#D97706',
          100: '#FDE8D0',
          50:  '#FFF8EE',
        },
        error: {
          700: '#991B1B',
          600: '#DC2626',
          500: '#EF4444',
          100: '#FDDEDE',
          50:  '#FFF5F5',
        },
        info: {
          700: '#1E3A5F',
          600: '#1A5C8A',
          500: '#2580C4',
          100: '#D0E8F5',
          50:  '#EEF6FC',
        },
      },
      fontFamily: {
        display: ['"Hello Paris"', 'serif'],
        ui:      ['"Codec Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(137,10,10,0.06)',
        sm: '0 1px 4px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
        xl: '0 16px 40px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}

export default config
