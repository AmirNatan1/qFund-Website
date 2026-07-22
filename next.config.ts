import type { NextConfig } from "next";

const isWorkerBuild = process.env.QFUND_BUILD_TARGET === "worker";

const nextConfig: NextConfig = isWorkerBuild
  ? {}
  : {
      output: "export",
      distDir: "dist",
      trailingSlash: true,
      typescript: {
        tsconfigPath: "tsconfig.pages.json",
      },
    };

export default nextConfig;
