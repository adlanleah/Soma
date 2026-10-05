/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "soma-light": {
          primary: "#00C9A7",
          secondary: "#0D1B2A",
        },
      },
    ],
  },
};