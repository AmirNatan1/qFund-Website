import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("../", import.meta.url);
const sourceUrl = new URL("../3D Objects/", import.meta.url);
const configUrl = new URL("../app/industries/industryConfig.ts", import.meta.url);

test("maps all eight supplied object sets into the canonical industry configuration", async () => {
  const [files, config] = await Promise.all([
    readdir(sourceUrl),
    readFile(configUrl, "utf8"),
  ]);

  const suppliedObjectSets = [
    "CyberSecurityHologram.jsx",
    "DatacenterScene.jsx",
    "Drone.jsx",
    "NuclearPlantComplex.jsx",
    "ParticleAccelerator.jsx",
    "SatelliteScene.jsx",
    "SensorArray.jsx",
    "quantum-computer.glb",
  ];

  assert.equal(suppliedObjectSets.length, 8);
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

  assert.equal((config.match(/model: null/g) ?? []).length, 0);
  assert.match(config, /slug: "cyber-and-attack-surfaces"[\s\S]*?source: "3D Objects\/CyberSecurityHologram\.jsx"/);
  assert.match(config, /slug: "sensing-rf-optics-and-quantum-intelligence"[\s\S]*?source: "3D Objects\/SensorArray\.jsx"/);
});

test("publishes the supplied binary model through the static 3D asset path", async () => {
  await Promise.all([
    access(new URL("out/3d/quantum-computer.glb", rootUrl)),
    access(new URL("dist/3d/quantum-computer.glb", rootUrl)),
  ]);
});

test("keeps wheel scrolling available while preserving drag rotation on every supplied scene", async () => {
  const sceneFiles = [
    "CyberSecurityHologram.jsx",
    "Drone.jsx",
    "DatacenterScene.jsx",
    "SatelliteScene.jsx",
    "ParticleAccelerator.jsx",
    "NuclearPlantComplex.jsx",
    "SensorArray.jsx",
  ];
  const [stage, ...scenes] = await Promise.all([
    readFile(new URL("../app/industries/IndustryModelStage.tsx", import.meta.url), "utf8"),
    ...sceneFiles.map((file) => readFile(new URL(file, sourceUrl), "utf8")),
  ]);

  assert.match(stage, /enableZoom=\{false\}/);
  assert.match(stage, /enableRotate/);
  assert.match(stage, /OrbitControls/);
  for (const [index, scene] of scenes.entries()) {
    assert.match(scene, /enableZoom=\{false\}/, `${sceneFiles[index]} should not capture the wheel to zoom`);
    assert.match(scene, /OrbitControls/, `${sceneFiles[index]} should retain drag rotation`);
  }
});

test("blends every supplied scene into the industry canvas while retaining space stars", async () => {
  const sceneFiles = [
    "Drone.jsx",
    "DatacenterScene.jsx",
    "SatelliteScene.jsx",
    "ParticleAccelerator.jsx",
    "NuclearPlantComplex.jsx",
    "CyberSecurityHologram.jsx",
    "SensorArray.jsx",
  ];
  const [stage, ...scenes] = await Promise.all([
    readFile(new URL("../app/industries/IndustryModelStage.tsx", import.meta.url), "utf8"),
    ...sceneFiles.map((file) => readFile(new URL(file, sourceUrl), "utf8")),
  ]);

  assert.match(stage, /<color attach="background" args=\{\["#042925"\]\}/);
  for (const [index, scene] of scenes.entries()) {
    assert.match(scene, /#071522/i, `${sceneFiles[index]} should use the shared deep brand-blue canvas`);
  }
  assert.match(scenes[2], /<Stars[\s\S]*?factor=\{3\.2\}/);
});

test("preloads every scene into one warmed WebGL renderer before industry scrolling", async () => {
  const [experience, stage, frontierField, nuclear, drone, datacenter, satellite, particle, styles] = await Promise.all([
    readFile(new URL("../app/industries/IndustriesExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/industries/IndustryModelStage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FrontierField.tsx", import.meta.url), "utf8"),
    readFile(new URL("NuclearPlantComplex.jsx", sourceUrl), "utf8"),
    readFile(new URL("Drone.jsx", sourceUrl), "utf8"),
    readFile(new URL("DatacenterScene.jsx", sourceUrl), "utf8"),
    readFile(new URL("SatelliteScene.jsx", sourceUrl), "utf8"),
    readFile(new URL("ParticleAccelerator.jsx", sourceUrl), "utf8"),
    readFile(new URL("../app/revamp.css", import.meta.url), "utf8"),
  ]);

  assert.match(experience, /scheduleIndustryAssetPreload/);
  assert.match(experience, /readyModelIds=\{mountedModelIds\}/);
  assert.match(experience, /<IndustrySharedCanvas/);
  assert.doesNotMatch(experience, /renderWindow|storyIsNearViewport/);
  assert.doesNotMatch(experience, /moving=\{isScrolling\}/);
  assert.match(experience, /CAROUSEL_INTERVAL_MS = 4500/);
  assert.match(experience, /setInterval/);
  assert.match(experience, /isAutoplayPaused/);
  assert.match(experience, /isModelInteracting/);
  assert.match(experience, /modelInteractingRef\.current/);
  assert.match(experience, /onInteractionStart=\{startModelInteraction\}/);
  assert.match(experience, /onInteractionEnd=\{endModelInteraction\}/);
  assert.match(experience, /Pause automatic industry slides/);
  assert.match(experience, /Resume automatic industry slides/);
  assert.match(experience, /aria-pressed=\{isAutoplayPaused\}/);
  assert.match(experience, /event\.target\.closest\("button, a, input, textarea, select"\)/);
  assert.match(experience, /visualIndexRef/);
  assert.match(experience, /wrapsForward/);
  assert.match(experience, /qf-industry-chapter-clone/);
  assert.match(experience, /classList\.add\("is-resetting"\)/);
  assert.match(experience, /exitArmedRef/);
  assert.match(experience, /GESTURE_IDLE_MS/);
  assert.match(experience, /event\.preventDefault\(\)/);
  assert.match(experience, /className=\{`qf-industry-story\$\{isImmersive/);
  assert.match(experience, /metricsRef/);
  assert.match(experience, /classList\.toggle\("qf-industries-immersive", active\)/);
  assert.match(stage, /useGLTF\.preload\("\/3d\/quantum-computer\.glb"\)/);
  assert.match(stage, /requestIdleCallback/);
  assert.match(stage, /announceRenderReady\(task\.id\)/);
  assert.equal((stage.match(/<Canvas/g) ?? []).length, 1);
  assert.match(stage, /dpr=\{\[1, 2\]\}/);
  assert.match(stage, /antialias: true/);
  assert.match(stage, /precision: "highp"/);
  assert.match(stage, /gl\.compileAsync/);
  assert.match(stage, /mergeGeometries/);
  assert.match(stage, /qf-optimized-quantum-computer/);
  assert.match(stage, /maxFps=\{60\}/);
  assert.match(stage, /onPointerDownCapture=\{onInteractionStart\}/);
  assert.match(stage, /onPointerUpCapture=\{onInteractionEnd\}/);
  assert.doesNotMatch(stage, /THREE\.DoubleSide/);
  assert.doesNotMatch(stage, /frustumCulled = false/);
  assert.doesNotMatch(stage, /function RenderBudget/);
  assert.doesNotMatch(stage, /function AdaptiveResolution/);
  // The hero field stops drawing whenever it leaves the viewport.
  assert.match(frontierField, /visibilityObserver/);
  // Scene loading waits for the opening reveal instead of competing with it.
  assert.match(experience, /whenIntroSettles/);
  assert.match(experience, /sceneStageReady \? \(/);
  assert.match(nuclear, /frames=\{1\}/);
  assert.match(nuclear, /backgroundTop = '#071522'/);
  assert.match(nuclear, /fog attach="fog" args=\{\[fogColor, 220, 600\]\}/);
  assert.match(drone, /cameraPosition = \[3\.8, 2\.55, 5\.9\]/);
  assert.match(styles, /html\.qf-industries-immersive \.qf-header/);
  assert.match(styles, /translate3d\(0, -105%, 0\)/);
  assert.match(styles, /contain: layout paint style/);
  assert.match(styles, /height: 100svh/);
  assert.match(styles, /left: calc\(var\(--qf-industry-active-index\) \* 100vw\)/);
  assert.match(styles, /\.qf-industry-story\.is-immersive/);
  assert.match(styles, /transition: transform 1000ms/);
  assert.match(styles, /\.qf-industry-track\.is-resetting \{ transition: none; \}/);
  assert.match(styles, /\.qf-industry-autoplay/);
  assert.match(styles, /\.qf-check-written/);
  assert.match(styles, /@keyframes qf-handwrite-reveal/);
  const homepage = await readFile(new URL("../app/QFundExperience.tsx", import.meta.url), "utf8");
  assert.match(homepage, /Builders of the deep future/);
  assert.doesNotMatch(homepage, /SCROLL TO WRITE|PAY TO THE|AUTHORIZED SIGNATURE/);
  assert.match(styles, /scale\(var\(--qf-industry-portal-scale\)\)/);
  assert.match(styles, /--qf-industry-portal-scale: 0\.975/);
  assert.match(styles, /--qf-industry-portal-scale: 1\.012/);
  assert.match(styles, /translate3d\(0, 2\.15rem, 0\) scale\(0\.992\)/);
});
