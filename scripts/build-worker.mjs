import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  ["./node_modules/vinext/dist/cli.js", "build"],
  {
    env: {
      ...process.env,
      QFUND_BUILD_TARGET: "worker",
    },
    stdio: "inherit",
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
