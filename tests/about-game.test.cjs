const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

// Compile the actual game physics in isolation; no browser or test dependency.
const output = mkdtempSync(join(tmpdir(), 'liz-world-test-'));
execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), 'src/components/about-game/physics.ts', '--outDir', output, '--module', 'commonjs', '--target', 'ES2022', '--skipLibCheck', '--types', 'node', '--esModuleInterop', '--jsx', 'react', '--jsxFactory', 'h'], { stdio: 'pipe' });
const physics = require(join(output, 'components/about-game/physics.js'));
const { FLOOR, WORLD_WIDTH } = require(join(output, 'components/about-game/model.js'));
after(() => rmSync(output, { recursive: true, force: true }));
const advance = (p, seconds, dir = 0, platforms = []) => { for (let i = 0; i < seconds * 120; i++) physics.stepPlayer(p, dir, 1 / 120, platforms); };
const grounded = () => { const p = physics.createWorld().player; advance(p, 1); return p; };

test('entry fall lands exactly on the continuous floor', () => {
  const p = grounded(); assert.equal(p.y + p.height, FLOOR); assert.equal(p.grounded, true); assert.equal(p.vy, 0);
});
test('accelerates to capped speed and decelerates when input is released', () => {
  const p = grounded(); physics.stepPlayer(p, 1, 1 / 120); assert.ok(p.vx > 0 && p.vx < 270); advance(p, 1, 1); assert.equal(p.vx, 270); advance(p, .3); assert.equal(p.vx, 0);
});
test('jump gains height then lands, and airborne input cannot double-jump', () => {
  const p = grounded(); physics.queueJump(p); advance(p, .12); assert.ok(p.y + p.height < FLOOR - 40); assert.equal(p.grounded, false);
  const velocity = p.vy; physics.queueJump(p); physics.stepPlayer(p, 0, 1 / 120); assert.ok(p.vy > velocity); advance(p, 1); assert.equal(p.y + p.height, FLOOR);
});
test('one-way platform catches a descending character', () => {
  const p = grounded(); p.x = 420; p.y = 250; p.vy = 100; p.grounded = false;
  advance(p, .6, 0, [{ x: 400, y: 350, width: 150 }]); assert.equal(p.y + p.height, 350); assert.equal(p.grounded, true);
});
test('rising character passes through platform from below', () => {
  const p = grounded(); p.x = 420; physics.queueJump(p); advance(p, .22, 0, [{ x: 400, y: 350, width: 150 }]); assert.ok(p.y + p.height < 350); assert.ok(p.vy < 0);
});
test('coyote time permits a jump immediately after leaving an edge', () => {
  const p = grounded(); p.grounded = false; p.coyote = .08; physics.queueJump(p); physics.stepPlayer(p, 1, 1 / 120); assert.ok(p.vy < 0);
});
test('left and right boundaries are respected', () => {
  const p = grounded(); advance(p, 5, -1); assert.equal(p.x, 20); advance(p, 20, 1); assert.equal(p.x, WORLD_WIDTH - p.width - 20);
});
test('nearest station requires proximity horizontally and vertically', () => {
  const world = physics.createWorld(); world.player.x = 275; world.player.y = FLOOR - world.player.height; assert.equal(physics.nearestStation(world), 0); world.player.y = 0; assert.equal(physics.nearestStation(world), null);
});
test('discoveries can happen out of order and revisits never increase progress', () => {
  const world = physics.createWorld(); assert.equal(physics.discover(world, 2), true); assert.equal(physics.discover(world, 0), true); assert.equal(physics.discover(world, 2), false); assert.equal(world.visited.size, 2);
});
test('portal is locked until the first three stations, then completes at 4/4', () => {
  const world = physics.createWorld(); assert.equal(physics.discover(world, 3), false); assert.equal(world.visited.size, 0);
  [1, 2, 0].forEach((id) => physics.discover(world, id)); assert.equal(physics.portalReady(world), true); assert.equal(physics.discover(world, 3), true); assert.equal(world.visited.size, 4);
});
test('reset creates an independent clean run', () => {
  const previous = physics.createWorld(); physics.discover(previous, 0); previous.player.x = 1000;
  const reset = physics.createWorld(); assert.equal(reset.visited.size, 0); assert.equal(reset.player.x, 90); assert.equal(reset.camera, 0); assert.equal(reset.nearest, null);
});
