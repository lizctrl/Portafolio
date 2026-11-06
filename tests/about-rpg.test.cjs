const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { resolve, join } = require('node:path');
const output = mkdtempSync(join(tmpdir(), 'liz-rpg-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), 'src/components/about-rpg/physics.ts', '--outDir', output, '--target', 'ES2022', '--module', 'commonjs', '--skipLibCheck', '--types', 'node', '--jsx', 'react', '--jsxFactory', 'h'], { stdio: 'pipe' });
const { createRPG, movePlayer, canStand, nearestInteraction, changeScene, discoverQuest, discoverMotivation } = require(join(output, 'components/about-rpg/physics.js'));
const { SCENES } = require(join(output, 'components/about-rpg/map.js'));
const advance = (state, input, seconds) => { for (let i = 0; i < seconds * 120; i++) movePlayer(state, input, 1 / 120); };

test('spawn is walkable in all three scenes', () => { for (const map of Object.values(SCENES)) assert.ok(canStand(map.id, map.spawn.x, map.spawn.y), map.id); });
test('walking supports all four directions and updates facing', () => {
  for (const [input, facing] of [[{ x: 1, y: 0 }, 'right'], [{ x: -1, y: 0 }, 'left'], [{ x: 0, y: -1 }, 'up'], [{ x: 0, y: 1 }, 'down']]) {
    const state = createRPG(); const before = { ...state.player }; advance(state, input, .1); assert.equal(state.player.facing, facing); assert.ok(Math.hypot(state.player.x - before.x, state.player.y - before.y) > 5);
  }
});
test('diagonal motion is normalized rather than faster', () => {
  const axis = createRPG(), diagonal = createRPG(); advance(axis, { x: 1, y: 0 }, .2); advance(diagonal, { x: 1, y: 1 }, .2);
  assert.ok(Math.abs(Math.hypot(diagonal.player.x - 528, diagonal.player.y - 384) - (axis.player.x - 528)) < .01);
});
test('water and buildings are solid', () => {
  assert.equal(canStand('village', 500, 150), false); assert.equal(canStand('village', 252, 200), false); assert.equal(canStand('village', 792, 200), false);
});
test('tree trunks and rocks stop a walking character', () => {
  const state = createRPG(); state.player.x = 144; state.player.y = 386; advance(state, { x: 0, y: -1 }, 1); assert.ok(state.player.y > 360);
  assert.equal(canStand('village', 96, 430), false);
});
test('long movement cannot tunnel through walls or leave the map', () => {
  const state = createRPG(); state.player.x = 90; state.player.y = 384; advance(state, { x: -1, y: 0 }, 5); assert.ok(state.player.x >= 66); assert.equal(canStand(state.scene, state.player.x, state.player.y), true);
});
test('player slides along an obstacle while the free axis continues', () => {
  const state = createRPG(); state.player.x = 338; state.player.y = 190; const before = state.player.y; advance(state, { x: -1, y: 1 }, .16); assert.ok(state.player.y > before); assert.equal(canStand(state.scene, state.player.x, state.player.y), true);
});
test('interaction requires proximity and uses the nearest object', () => {
  const state = createRPG(); assert.equal(nearestInteraction(state), null); state.player.x = 566; state.player.y = 384; assert.equal(nearestInteraction(state).id, 'welcome'); state.player.x = 252; state.player.y = 264; assert.equal(nearestInteraction(state).kind, 'enter-home');
});
test('interior doors preserve the correct village return position', () => {
  const state = createRPG(); changeScene(state, 'home'); assert.equal(state.scene, 'home'); assert.equal(canStand(state.scene, state.player.x, state.player.y), true); changeScene(state, 'village'); assert.equal(state.player.x, 252); assert.equal(state.player.y, 264);
  changeScene(state, 'lab'); changeScene(state, 'village'); assert.equal(state.player.x, 792);
});
test('portal objective is available first, with no completion gate', () => {
  const state = createRPG(); assert.equal(discoverQuest(state, 3), true); assert.equal(state.quests.size, 1); assert.equal(state.celebration, 0);
});
test('four distinct motivations complete the garden objective exactly once', () => {
  const state = createRPG(); [3, 1, 3, 0].forEach((i) => discoverMotivation(state, i)); assert.equal(state.motives.size, 3); assert.equal(state.quests.has(2), false); assert.equal(discoverMotivation(state, 2), true); assert.equal(state.quests.has(2), true); assert.equal(discoverMotivation(state, 2), false);
});
test('quests can complete out of order and trigger a bounded celebration', () => {
  const state = createRPG(); [3, 2, 0, 1].forEach((i) => discoverQuest(state, i)); assert.equal(state.quests.size, 4); assert.equal(state.celebration, 2); assert.ok(state.particles.length <= 36); assert.equal(discoverQuest(state, 0), false);
});
test('reset produces independent quest, visit and camera state', () => {
  const old = createRPG(); discoverQuest(old, 0); old.visits.add('terminal-0'); old.scene = 'lab'; const fresh = createRPG(); assert.equal(fresh.scene, 'village'); assert.equal(fresh.quests.size, 0); assert.equal(fresh.visits.size, 0);
});
test('all interactions are reachable from the spawn without crossing solid objects', () => {
  const step = 6;
  for (const map of Object.values(SCENES)) {
    const queue = [{ x: Math.round(map.spawn.x / step) * step, y: Math.round(map.spawn.y / step) * step }];
    const seen = new Set([`${queue[0].x},${queue[0].y}`]); let head = 0;
    while (head < queue.length) {
      const p = queue[head++];
      for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) { const x = p.x + dx, y = p.y + dy, key = `${x},${y}`; if (!seen.has(key) && canStand(map.id, x, y)) { seen.add(key); queue.push({ x, y }); } }
    }
    for (const interaction of map.interactions) assert.ok(queue.some((p) => Math.hypot(p.x - interaction.x, p.y - interaction.y) < 30), `${map.id}: ${interaction.id}`);
  }
});
