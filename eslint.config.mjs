import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".venv/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Python investigation pipeline and local scratch — not part of the app.
    "Fires/**",
    "tmp/**",
    // Generated theme artifacts from `astryx theme build`.
    "themes/jijel.js",
    "themes/*.d.ts",
  ]),
]);

export default eslintConfig;
