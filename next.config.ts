import type { NextConfig } from "next";

const isWorkerBuild = process.env.QFUND_BUILD_TARGET === "worker";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  ...(isWorkerBuild
    ? {}
    : {
        output: "export",
        trailingSlash: true,
        typescript: {
          tsconfigPath: "tsconfig.pages.json",
        },
      }),
};

export default nextConfig;
