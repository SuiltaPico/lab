import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import postcssNesting from "tailwindcss/nesting";

export default defineConfig({
  plugins: [solid()],
  css: {
    postcss: {
      plugins: [postcssNesting(), autoprefixer(), tailwindcss()],
    },
  },
});
