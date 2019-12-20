module.exports = {
  root: true,
  env: {
    "browser": true,
    node: true
  },
  extends: ["airbnb"],
  plugins: ["@typescript-eslint"],
  rules: {
    // "no-console": process.env.NODE_ENV === "production" ? "warning" : "off",
    // "no-debugger": process.env.NODE_ENV === "production" ? "warning" : "off",
    // "import/no-cycle": "off"
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020
  }
};
