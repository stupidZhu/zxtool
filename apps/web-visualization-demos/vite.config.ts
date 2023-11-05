import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import cesium from "vite-plugin-cesium"
import glsl from "vite-plugin-glsl"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [cesium(), glsl(), react()],
  resolve: {
    alias: [{ find: "src", replacement: path.resolve(__dirname, "src/") }],
  },
})
