import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const sourceDirectory = resolve("out");
const manifestPath = resolve(".pages-root-manifest.json");
const protectedEntries = new Set([
  ".agents",
  ".git",
  ".openai",
  ".pnpm-store",
  ".wrangler",
  "app",
  "build",
  "db",
  "dist",
  "drizzle",
  "examples",
  "node_modules",
  "out",
  "public",
  "scripts",
  "tests",
  "work",
  "worker",
]);

if (!existsSync(sourceDirectory)) {
  throw new Error("Static export is missing. Run the Pages build first.");
}

const previousEntries = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8")).entries
  : [];

for (const entry of previousEntries) {
  if (protectedEntries.has(entry)) {
    throw new Error(`Refusing to remove protected repository entry: ${entry}`);
  }
  rmSync(resolve(entry), { recursive: true, force: true });
}

const entries = readdirSync(sourceDirectory);

for (const entry of entries) {
  if (protectedEntries.has(entry)) {
    throw new Error(`Static export conflicts with repository entry: ${entry}`);
  }
  cpSync(resolve(sourceDirectory, entry), resolve(entry), { recursive: true });
}

writeFileSync(
  manifestPath,
  `${JSON.stringify({ entries }, null, 2)}\n`,
  "utf8",
);
