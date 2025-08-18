module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

      },
      animation: {
        fadeIn: "fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        fadeInFast: "fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) both",
        slideUp: "slideUp 0.9s cubic-bezier(0.19, 1, 0.22, 1) both",
        slideDown: "slideDown 0.9s cubic-bezier(0.19, 1, 0.22, 1) both",
        scaleIn: "scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-32px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
};
