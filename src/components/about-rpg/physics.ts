import { SCENES } from './map';
import type { RPGState, Point, Rect, Interaction, SceneId } from './model';

export function createRPG(): RPGState {
  return { scene: 'village', player: { ...SCENES.village.spawn, facing: 'up', moving: false, phase: 0, interact: 0 }, camera: { x: 0, y: 0 }, time: 0, quests: new Set(), motives: new Set(), visits: new Set(), particles: [], celebration: 0, nearest: null };
}
export function bodyAt(x: number, y: number): Rect { return { x: x - 6, y: y - 5, width: 12, height: 9 }; }
export function overlaps(a: Rect, b: Rect): boolean { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
export function canStand(scene: SceneId, x: number, y: number): boolean {
  const map = SCENES[scene], body = bodyAt(x, y);
  return body.x >= 0 && body.y >= 0 && body.x + body.width <= map.width && body.y + body.height <= map.height && !map.solids.some((solid) => overlaps(body, solid));
}
/** Axis-separated collision with small substeps prevents tunneling through trunks. */
export function movePlayer(state: RPGState, input: Point, dt: number): void {
  const p = state.player;
  const length = Math.hypot(input.x, input.y);
  const dx = length ? input.x / length : 0, dy = length ? input.y / length : 0;
  p.moving = false;
  if (length) {
    if (Math.abs(input.x) > Math.abs(input.y)) p.facing = input.x < 0 ? 'left' : 'right';
    else p.facing = input.y < 0 ? 'up' : 'down';
  }
  const steps = Math.max(1, Math.ceil(110 * Math.min(dt, .1) / 3));
  const distance = 110 * Math.min(dt, .1) / steps;
  for (let i = 0; i < steps; i++) {
    if (dx && canStand(state.scene, p.x + dx * distance, p.y)) { p.x += dx * distance; p.moving = true; }
    if (dy && canStand(state.scene, p.x, p.y + dy * distance)) { p.y += dy * distance; p.moving = true; }
  }
  if (p.moving) p.phase += dt * 11;
  else p.phase = 0;
  p.interact = Math.max(0, p.interact - dt);
  state.celebration = Math.max(0, state.celebration - dt);
}
export function nearestInteraction(state: RPGState): Interaction | null {
  let nearest: Interaction | null = null, best = 37;
  for (const item of SCENES[state.scene].interactions) {
    const distance = Math.hypot(item.x - state.player.x, item.y - state.player.y);
    if (distance < best) { best = distance; nearest = item; }
  }
  return nearest;
}
export function changeScene(state: RPGState, scene: SceneId): void {
  const previous = state.scene;
  state.scene = scene;
  const spawn = scene === 'village' ? { x: previous === 'home' ? 252 : 792, y: 264 } : SCENES[scene].spawn;
  state.player = { ...spawn, facing: scene === 'village' ? 'down' : 'up', moving: false, phase: 0, interact: 0 };
  state.nearest = null; state.camera = { x: 0, y: 0 };
}
export function discoverQuest(state: RPGState, id: number): boolean {
  if (id < 0 || id > 3 || state.quests.has(id)) return false;
  state.quests.add(id);
  if (state.quests.size === 4) { state.celebration = 2; burst(state, state.player.x, state.player.y - 12, 22); }
  return true;
}
export function discoverMotivation(state: RPGState, index: number): boolean {
  if (index < 0 || index > 3 || state.motives.has(index)) return false;
  state.motives.add(index);
  if (state.motives.size === 4) discoverQuest(state, 2);
  burst(state, state.player.x, state.player.y - 10, 7);
  return true;
}
export function burst(state: RPGState, x: number, y: number, count: number): void {
  for (let i = 0; i < count && state.particles.length < 36; i++) {
    const angle = (i / count) * Math.PI * 2;
    state.particles.push({ x, y, vx: Math.cos(angle) * 19, vy: Math.sin(angle) * 15 - 8, age: 0, life: .8 });
  }
}
