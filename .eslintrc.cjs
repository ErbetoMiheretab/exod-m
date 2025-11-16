module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "warn",
    "no-undef": "error",
    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        alphabetize: { order: "asc" },
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
      },
    ],
  },
};
