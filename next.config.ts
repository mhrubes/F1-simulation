import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const race = require("./config.js") as { firstRacerFast: boolean };

const rawFirst = process.env.NEXT_PUBLIC_FIRST_RACER_FAST;
const nextConfig: NextConfig = {
  env: {
    ...(rawFirst === undefined || rawFirst === ""
      ? {
          NEXT_PUBLIC_FIRST_RACER_FAST: race.firstRacerFast
            ? "true"
            : "false",
        }
      : {}),
  },
};

export default nextConfig;
