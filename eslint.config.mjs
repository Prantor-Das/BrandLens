import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["lib/generated/prisma/**"]
  },
  ...nextVitals
];

export default config;
