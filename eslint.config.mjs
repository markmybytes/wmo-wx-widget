import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const config = [
  { ignores: ["node_modules/**", ".next/**", "out/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier,
];

export default config;
