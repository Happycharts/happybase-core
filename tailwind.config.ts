import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        grid: "grid 15s linear infinite",
      },
      keyframes: {
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          DEFAULT: '#FF5A5F', // The pink color used for buttons and highlights
          dark: '#FF2E35', // A darker shade for hover states
        },
        secondary: '#000000', // The black color used for text
        background: '#FFFFFF', // The white background
        'muted-foreground': '#666666', // For subtitle text
        'light-pink': '#FFE5E5', // The light pink used in the top banner
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Assuming Inter is the font used, adjust if different
      },
      fontSize: {
        '5xl': '3rem', // For the main headline
        '2xl': '1.5rem', // For subheadings
      },
      borderRadius: {
        'lg': '0.5rem', // For buttons and other rounded elements
      },
    },
  },
  plugins: [],
};

export default config;