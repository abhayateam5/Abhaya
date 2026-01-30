import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Background Layers
                background: {
                    DEFAULT: 'hsl(220, 60%, 2%)',
                    soft: 'hsl(220, 40%, 6%)',
                    muted: 'hsl(220, 30%, 10%)',
                },
                // Text Hierarchy
                foreground: {
                    DEFAULT: 'hsl(210, 40%, 98%)',
                    muted: 'hsl(215, 20%, 65%)',
                },
                // Brand Colors
                primary: {
                    DEFAULT: 'hsl(199, 89%, 48%)',
                    foreground: 'hsl(0, 0%, 100%)',
                    50: 'hsl(199, 89%, 95%)',
                    100: 'hsl(199, 89%, 85%)',
                    200: 'hsl(199, 89%, 75%)',
                    300: 'hsl(199, 89%, 65%)',
                    400: 'hsl(199, 89%, 55%)',
                    500: 'hsl(199, 89%, 48%)',
                    600: 'hsl(199, 89%, 40%)',
                    700: 'hsl(199, 89%, 32%)',
                    800: 'hsl(199, 89%, 24%)',
                    900: 'hsl(199, 89%, 16%)',
                },
                secondary: {
                    DEFAULT: 'hsl(239, 84%, 67%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
                accent: {
                    DEFAULT: 'hsl(160, 84%, 39%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
                // Status Colors
                success: {
                    DEFAULT: 'hsl(142, 71%, 45%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
                warning: {
                    DEFAULT: 'hsl(38, 92%, 50%)',
                    foreground: 'hsl(0, 0%, 0%)',
                },
                danger: {
                    DEFAULT: 'hsl(0, 84%, 60%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
                // Special
                gold: {
                    DEFAULT: 'hsl(45, 93%, 47%)',
                    foreground: 'hsl(0, 0%, 0%)',
                },
                // UI Elements
                border: 'hsl(220, 30%, 18%)',
                input: 'hsl(220, 30%, 18%)',
                ring: 'hsl(199, 89%, 48%)',
                card: {
                    DEFAULT: 'hsl(220, 40%, 6%)',
                    foreground: 'hsl(210, 40%, 98%)',
                },
                muted: {
                    DEFAULT: 'hsl(220, 30%, 10%)',
                    foreground: 'hsl(215, 20%, 65%)',
                },
            },
            borderRadius: {
                lg: '0.75rem',
                md: '0.5rem',
                sm: '0.25rem',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                'pulse-sos': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
                    '50%': { boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)' },
                },
                'safety-pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
                    '50%': { transform: 'scale(1.05)', opacity: '1' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'ping-slow': {
                    '75%, 100%': { transform: 'scale(2)', opacity: '0' },
                },
            },
            animation: {
                'pulse-sos': 'pulse-sos 1.5s ease-in-out infinite',
                'safety-pulse': 'safety-pulse 2s ease-in-out infinite',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-up': 'slide-up 0.4s ease-out',
                'gradient-shift': 'gradient-shift 3s ease infinite',
                shimmer: 'shimmer 2s linear infinite',
                'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(14, 165, 233, 0.3)',
                'glow-danger': '0 0 20px rgba(239, 68, 68, 0.4)',
                'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
                'glow-warning': '0 0 20px rgba(234, 179, 8, 0.3)',
                glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
            },
        },
    },
    plugins: [],
};

export default config;
