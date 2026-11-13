const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const THREE = require('three');

const source = ts.transpileModule(readFileSync('lib/sceneLifecycle.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function environment(hidden = false) {
  const document = new EventTarget();
  document.hidden = hidden;
  let nextId = 0;
  const frames = new Map();
  const exports = {};
  vm.runInNewContext(source, {
    exports, document,
    requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  return {
    ...exports, document, frames,
    tick(now) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(now));
    },
  };
}

for (const hz of [60, 120, 144]) test(`decorative rendering stays near 30 fps at ${hz} Hz and retains elapsed movement`, () => {
  const env = environment();
  const scales = [];
  const stop = env.startSceneLoop(scale => scales.push(scale));
  for (let now = 0; now < 1000; now += 1000 / hz) env.tick(now);
  assert.ok(scales.length <= 31 && scales.length >= 29, `${scales.length} frames`);
  assert.ok(Math.abs(scales.reduce((sum, scale) => sum + scale, 0) - 60) < 3);
  stop();
  assert.equal(env.frames.size, 0);
});

test('hidden tabs schedule no frames, resume without a jump, and stay stopped after disposal', () => {
  const env = environment(true);
  const scales = [];
  const stop = env.startSceneLoop(scale => scales.push(scale));
  assert.equal(env.frames.size, 0);
  env.document.hidden = false;
  env.document.dispatchEvent(new Event('visibilitychange'));
  env.tick(10000);
  assert.equal(scales.length, 1);
  assert.ok(scales[0] <= 2);
  env.document.hidden = true;
  env.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.frames.size, 0);
  stop();
  env.document.hidden = false;
  env.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.frames.size, 0);
});

test('a stalled main thread cannot advance a scene by more than 100 ms', () => {
  const env = environment();
  const scales = [];
  const stop = env.startSceneLoop(scale => scales.push(scale));
  env.tick(0);
  env.tick(5000);
  assert.ok(scales[1] <= 6);
  stop();
});

test('switching scenes disposes geometry, material, and textures shared by clones exactly once', () => {
  const root = new THREE.Scene();
  const geometry = new THREE.BoxGeometry();
  const texture = new THREE.Texture();
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const original = new THREE.Mesh(geometry, material);
  root.add(original, original.clone(), new THREE.Mesh(geometry, [material, material]));
  const counts = [0, 0, 0];
  [geometry, material, texture].forEach((resource, i) => resource.addEventListener('dispose', () => counts[i]++));
  environment().disposeScene(root);
  assert.deepEqual(counts, [1, 1, 1]);
});
