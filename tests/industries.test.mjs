import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("../", import.meta.url);
const sourceUrl = new URL("../3D Objects/", import.meta.url);
const configUrl = new URL("../app/industries/industryConfig.ts", import.meta.url);

test("maps the six supplied object sets into the canonical eight-industry configuration", async () => {
  const [files, config] = await Promise.all([
    readdir(sourceUrl),
    readFile(configUrl, "utf8"),
  ]);

  const suppliedObjectSets = [
    "DatacenterScene.jsx",
    "Drone.jsx",
    "NuclearPlantComplex.jsx",
    "ParticleAccelerator.jsx",
    "SatelliteScene.jsx",
    "quantum-computer.glb",
  ];

  assert.equal(suppliedObjectSets.length, 6);
  for (const file of suppliedObjectSets) {
    assert.ok(files.includes(file), `${file} should be present in 3D Objects`);
    assert.match(config, new RegExp(file.replaceAll(".", "\\.")));
  }

  const canonicalTitles = [
    "Quantum Computing",
    "Robotics and Drones",
    "Data Centers",
    "Space",
    "Particle Accelerators",
    "Cyber & Attack Surfaces",
    "Sensing, RF, Optics & Quantum Intelligence",
    "Geothermal & Nuclear Energy",
  ];

  let previousIndex = -1;
  for (const title of canonicalTitles) {
    const index = config.indexOf(`title: "${title}"`);
    assert.ok(index > previousIndex, `${title} should appear in canonical order`);
    previousIndex = index;
  }

  assert.equal((config.match(/model: null/g) ?? []).length, 2);
  assert.match(config, /slug: "cyber-and-attack-surfaces"[\s\S]*?model: null/);
  assert.match(config, /slug: "sensing-rf-optics-and-quantum-intelligence"[\s\S]*?model: null/);
});

test("publishes the supplied binary model through the static 3D asset path", async () => {
  await Promise.all([
    access(new URL("out/3d/quantum-computer.glb", rootUrl)),
    access(new URL("dist/3d/quantum-computer.glb", rootUrl)),
  ]);
});
