/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary-dim": "#3a5a48", "on-tertiary-fixed-variant": "#496a57", "on-tertiary-container": "#3f5f4d", "on-tertiary-fixed": "#2d4d3c", "tertiary-fixed-dim": "#c4e8d1", "error-container": "#fa746f", "primary-dim": "#00603b", "on-surface-variant": "#58615f", "surface-container": "#e9efed", "background": "#f7faf8", "on-secondary-container": "#2c5b43", "on-secondary-fixed-variant": "#36654d", "surface-tint": "#016d44", "primary-fixed": "#9cf5c1", "error": "#a83836", "on-primary-container": "#005e3a", "tertiary-fixed": "#d2f7df", "surface-container-lowest": "#ffffff", "primary-fixed-dim": "#8ee7b3", "surface-variant": "#dbe4e2", "surface-dim": "#d3dcd9", "surface-container-high": "#e2eae7", "secondary-fixed": "#bbeecf", "tertiary": "#466654", "surface": "#f7faf8", "error-dim": "#67040d", "inverse-on-surface": "#9a9e9c", "on-secondary": "#e6ffee", "surface-container-low": "#f0f5f2", "on-primary-fixed": "#00492c", "outline": "#747d7a", "secondary": "#396850", "on-error": "#fff7f6", "on-secondary-fixed": "#174832", "on-background": "#2c3432", "outline-variant": "#abb4b1", "secondary-container": "#bbeecf", "surface-bright": "#f7faf8", "tertiary-container": "#d2f7df", "on-primary-fixed-variant": "#006942", "on-surface": "#2c3432", "primary": "#016d44", "primary-container": "#9cf5c1", "on-primary": "#e7ffec", "on-error-container": "#6e0a12", "on-tertiary": "#e6ffee", "inverse-primary": "#a4fec9", "secondary-dim": "#2d5c45", "inverse-surface": "#0b0f0e", "surface-container-highest": "#dbe4e2", "secondary-fixed-dim": "#ade0c2"
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans"], body: ["Plus Jakarta Sans"], label: ["Plus Jakarta Sans"], display: "Plus Jakarta Sans"
      }
    },
  },
  plugins: [],
}
