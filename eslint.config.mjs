import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ─── Custom plugin: forbid em dashes (—, U+2014, &mdash;) ─── */
const noEmDashPlugin = {
  rules: {
    "no-em-dash": {
      meta: {
        type: "problem",
        docs: { description: "Forbid em dash characters. Use hyphen, colon, comma, or semicolon." },
        messages: { found: "Em dash found. Use a hyphen (-), colon (:), comma, or semicolon instead." },
      },
      create(context) {
        const hasEmDash = (s) => s.includes("\u2014") || s.toLowerCase().includes("&mdash;");
        return {
          Literal(node) {
            if (typeof node.value === "string" && hasEmDash(node.value)) {
              context.report({ node, messageId: "found" });
            }
          },
          JSXText(node) {
            if (hasEmDash(node.value)) {
              context.report({ node, messageId: "found" });
            }
          },
          TemplateLiteral(node) {
            for (const q of node.quasis) {
              if (hasEmDash(q.value.raw)) {
                context.report({ node, messageId: "found" });
              }
            }
          },
        };
      },
    },
  },
};

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { "calcforge": noEmDashPlugin },
  rules: {
    // CalcForge house rules
    "calcforge/no-em-dash": "error",
  },
}, {
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",
    
    // React rules
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",
    
    // Next.js rules
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",
    
    // General JavaScript rules
    "prefer-const": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-empty": "off",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-useless-escape": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills"]
}];

export default eslintConfig;
