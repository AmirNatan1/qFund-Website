import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
cpSync("out", "dist", { recursive: true });
mkdirSync("dist/client", { recursive: true });
cpSync("out", "dist/client", { recursive: true });
