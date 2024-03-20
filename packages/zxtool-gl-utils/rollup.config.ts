import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import { RollupOptions } from "rollup"
import autoExternal from "rollup-plugin-auto-external"
import copy from "rollup-plugin-copy"
import { terser } from "rollup-plugin-terser"
import pkg from "./package.json"

// eslint-disable-next-line turbo/no-undeclared-env-vars
const isProd = process.env.MODE === "prod"

const config: RollupOptions = {
  input: "src/index.ts",
  output: [{ file: pkg.main, format: "umd", name: "ZGU", globals: { "@zxtool/utils": "ZU" } }],
  external: [/^(three\/examples\/jsm)/],
  plugins: [
    autoExternal(),
    resolve(),
    commonjs(),
    // esBuild({ tsconfig: "tsconfig.build.json" }),
    typescript({ tsconfig: "tsconfig.build.json" }),
    copy({ targets: [{ src: "src/type", dest: "dist" }] }),
    isProd && terser(),
  ],
}

export default config
