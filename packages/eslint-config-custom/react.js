module.exports = {
  extends: ["./ts.js", "plugin:react-hooks/recommended", "plugin:react/recommended", "plugin:react/jsx-runtime"],
  parser: "@typescript-eslint/parser",
  plugins: ["react", "react-hooks"],
  rules: { "react/prop-types": "off" },
  settings: { react: { version: "detect" } },
}
