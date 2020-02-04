module.exports = {
  root: true,
  env: {
    "browser": true
  },
  extends: ["airbnb", "plugin:prettier/recommended"],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier": 'warn'
    // "no-console": process.env.NODE_ENV === "production" ? "warning" : "off",
    // "no-debugger": process.env.NODE_ENV === "production" ? "warning" : "off",
    // "import/no-cycle": "off"
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020
  }
};
