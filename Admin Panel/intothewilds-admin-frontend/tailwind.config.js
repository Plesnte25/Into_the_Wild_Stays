/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "dark-space": "rgb(var(--color-dark-space) / <alpha-value>)",
        "black-grey": "rgb(var(--color-black-grey) / <alpha-value>)",
        teal: "rgb(var(--color-teal) / <alpha-value>)",
        "light-grey": "rgb(var(--color-light-grey) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
