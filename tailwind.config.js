/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require("@tailwindcss/typography"), require("daisyui"), moreAspectRatios],

  daisyui: {
    themes: ["light", "dark", "emerald", "night", "business", "cyberpunk"],
    darkTheme: "night",
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}





function moreAspectRatios({ addUtilities }) {
  const newUtilities = {}
  const ratios = ["1/1", "4/3", "3/2", "16/9", "85/110"]

  ratios.forEach(ratio => {
    const [w, h] = ratio.split("/")
    newUtilities[`.aspect-${w}-${h}`] = {
      aspectRatio: ratio.replace("-", ".")
    }
  })

  addUtilities(newUtilities, ["responsive", "hover"])
}

