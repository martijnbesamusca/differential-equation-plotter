module.exports = {
  root: true,
  env: {
    "browser": true,
    node: true
  },
  extends: [
    "plugin:vue/essential",
    "@vue/eslint-config-airbnb",
    "@vue/prettier",
    "@vue/typescript"
  ],
  rules: {
    // "no-console": process.env.NODE_ENV === "production" ? "warning" : "off",
    // "no-debugger": process.env.NODE_ENV === "production" ? "warning" : "off",
    "import/no-cycle": "off"
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020
  }
};
