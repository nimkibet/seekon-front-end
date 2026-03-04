/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Balanced Seekon Apparel Color System
        
        // Primary Palette (Base Identity) - 70% Midnight Black, 20% Soft White, 10% Electric Red
        primary: {
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#fafafa',
          300: '#f7f7f7',
          400: '#f0f0f0',
          500: '#FDFDFD', // Soft White - Primary Text
          600: '#e6e6e6',
          700: '#cccccc',
          800: '#999999',
          900: '#666666',
        },
        secondary: {
          50: '#fff5f5',
          100: '#ffe5e5',
          200: '#ffcccc',
          300: '#ff9999',
          400: '#ff6666',
          500: '#FF2E2E', // Electric Red - Primary Accent
          600: '#e62929',
          700: '#cc2525',
          800: '#b32020',
          900: '#991c1c',
        },
        accent: {
          50: '#0c0c0c',
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#404040',
          400: '#535353',
          500: '#0C0C0C', // Midnight Black - Primary Base
          600: '#0a0a0a',
          700: '#080808',
          800: '#060606',
          900: '#040404',
        },
        
        // Secondary Palette (Tech & Modern Feel) - 60% Deep Navy, 30% Platinum Silver, 10% Neon Cyan
        tech: {
          50: '#f0f2f5',
          100: '#e5e8ec',
          200: '#d1d6dd',
          300: '#b8c0ca',
          400: '#9aa5b3',
          500: '#E5E8EC', // Platinum Silver - Panel Background
          600: '#d1d6dd',
          700: '#b8c0ca',
          800: '#9aa5b3',
          900: '#7d8a9a',
        },
        navy: {
          50: '#2a3a5c',
          100: '#253550',
          200: '#1f2e44',
          300: '#1a2738',
          400: '#15202c',
          500: '#1B2340', // Deep Navy - Secondary Base
          600: '#181f3a',
          700: '#151b34',
          800: '#12172e',
          900: '#0f1328',
        },
        neon: {
          50: '#e6f9ff',
          100: '#ccf2ff',
          200: '#99e5ff',
          300: '#66d8ff',
          400: '#33cbff',
          500: '#00E5FF', // Neon Cyan - Accent Glow
          600: '#00cce6',
          700: '#00b3cc',
          800: '#0099b3',
          900: '#008099',
        },
        
        // Luxury Palette (Premium Collection) - 65% Charcoal Gray, 25% Pure White, 10% Gold Metallic
        luxury: {
          50: '#f7f7f7',
          100: '#efefef',
          200: '#dfdfdf',
          300: '#cfcfcf',
          400: '#bfbfbf',
          500: '#2F2F2F', // Charcoal Gray - Luxury Base
          600: '#2a2a2a',
          700: '#252525',
          800: '#202020',
          900: '#1b1b1b',
        },
        gold: {
          50: '#fdf9e7',
          100: '#fbf3cf',
          200: '#f7e79f',
          300: '#f3db6f',
          400: '#efcf3f',
          500: '#D4AF37', // Gold Metallic - Luxury Accent
          600: '#bf9e31',
          700: '#aa8d2b',
          800: '#957c25',
          900: '#806b1f',
        },
        pure: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
          300: '#ffffff',
          400: '#ffffff',
          500: '#FFFFFF', // Pure White - Neutral Contrast
          600: '#e6e6e6',
          700: '#cccccc',
          800: '#b3b3b3',
          900: '#999999',
        },
        
        // Unified Brand Colors (Easy Access)
        seekon: {
          // Primary Palette
          midnight: '#0C0C0C', // Midnight Black
          softWhite: '#FDFDFD', // Soft White
          electricRed: '#FF2E2E', // Electric Red
          
          // Secondary Palette
          deepNavy: '#1B2340', // Deep Navy
          neonCyan: '#00E5FF', // Neon Cyan
          platinumSilver: '#E5E8EC', // Platinum Silver
          
          // Luxury Palette
          charcoalGray: '#2F2F2F', // Charcoal Gray
          charcoalGrayCustom: '#2C2C2C', // Custom Charcoal Gray for glassmorphism
          goldMetallic: '#D4AF37', // Gold Metallic
          pureWhite: '#FFFFFF', // Pure White
          
          // Unified Balance Colors
          base: '#0C0C0C', // Base (Black/Gray) = 60%
          light: '#FDFDFD', // Light (White/Silver) = 25%
          accent: '#FF2E2E', // Accent (Red/Gold/Cyan) = 15%
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'premium-glow': 'premiumGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #FF2E2E, 0 0 10px #FF2E2E, 0 0 15px #FF2E2E' },
          '100%': { boxShadow: '0 0 10px #FF2E2E, 0 0 20px #FF2E2E, 0 0 30px #FF2E2E' },
        },
        premiumGlow: {
          '0%': { boxShadow: '0 0 5px #D4AF37, 0 0 10px #D4AF37, 0 0 15px #D4AF37' },
          '100%': { boxShadow: '0 0 10px #D4AF37, 0 0 20px #D4AF37, 0 0 30px #D4AF37' },
        },
        neonGlow: {
          '0%': { boxShadow: '0 0 5px #00E5FF, 0 0 10px #00E5FF, 0 0 15px #00E5FF' },
          '100%': { boxShadow: '0 0 10px #00E5FF, 0 0 20px #00E5FF, 0 0 30px #00E5FF' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Primary Palette Gradients
        'gradient-primary': 'linear-gradient(135deg, #FF2E2E 0%, #0C0C0C 100%)',
        'gradient-base': 'linear-gradient(135deg, #0C0C0C 0%, #2F2F2F 100%)',
        
        // Secondary Palette Gradients
        'gradient-tech': 'linear-gradient(135deg, #1B2340 0%, #E5E8EC 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00E5FF 0%, #1B2340 100%)',
        
        // Luxury Palette Gradients
        'gradient-luxury': 'linear-gradient(135deg, #D4AF37 0%, #2F2F2F 100%)',
        'gradient-premium': 'linear-gradient(135deg, #D4AF37 0%, #FFFFFF 100%)',
        
        // Unified Brand Gradients
        'gradient-balanced': 'linear-gradient(135deg, #0C0C0C 0%, #FDFDFD 50%, #FF2E2E 100%)',
        'gradient-modern': 'linear-gradient(135deg, #1B2340 0%, #00E5FF 100%)',
      },
    },
  },
  plugins: [],
}