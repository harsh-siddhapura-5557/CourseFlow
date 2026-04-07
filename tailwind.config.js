/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#4f46e5",
        background: "#f8fafc",
        text: "#0f172a",
        muted: "#64748b",
        accent: "#f59e0b",
        card: "#ffffff",
      },
    },
  },
  plugins: [],
}
