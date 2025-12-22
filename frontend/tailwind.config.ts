import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors - Clean white/black theme
        background: '#ffffff',
        foreground: '#000000',
        border: 'rgba(0, 0, 0, 0.1)',
        // Clean palette
        glass: {
          50: 'rgba(0, 0, 0, 0.02)',
          100: 'rgba(0, 0, 0, 0.05)',
          200: 'rgba(0, 0, 0, 0.08)',
          300: 'rgba(0, 0, 0, 0.12)',
        },
        primary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          500: '#404040',
          600: '#262626',
          700: '#171717',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
