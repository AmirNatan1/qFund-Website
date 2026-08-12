import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "3D Objects");
const outputRoot = path.join(root, "public", "3d");
const codeExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);

async function copyStaticAssets(sourceDirectory, outputDirectory) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(
    entries.map(async (entry) => {
      const source = path.join(sourceDirectory, entry.name);
      const output = path.join(outputDirectory, entry.name);

      if (entry.isDirectory()) {
        await copyStaticAssets(source, output);
        return;
      }

      if (entry.isFile() && !codeExtensions.has(path.extname(entry.name).toLowerCase())) {
        await copyFile(source, output);
      }
    }),
  );
}

await copyStaticAssets(sourceRoot, outputRoot);
console.log("Synced static 3D assets from 3D Objects to public/3d.");
