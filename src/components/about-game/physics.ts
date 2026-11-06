import { FLOOR, WORLD_WIDTH, STATIONS, PLATFORMS, type Player, type World, type Platform } from './model';

export function createWorld(): World {
  return {
    player: { x: 90, y: FLOOR - 160, vx: 0, vy: 0, width: 30, height: 58, grounded: false, facing: 1, coyote: 0, jumpBuffer: 0, reaction: 0, state: 'fall' },
    camera: 0, time: 0, visited: new Set(), particles: [], nearest: null,
  };
}
export function queueJump(player: Player): void { player.jumpBuffer = .13; }
const approach = (value: number, target: number, delta: number): number => value < target ? Math.min(value + delta, target) : Math.max(value - delta, target);

/** Pure physics, independent from Canvas and DOM. Pass a fixed small timestep. */
export function stepPlayer(player: Player, direction: number, dt: number, platforms: readonly Platform[] = PLATFORMS): boolean {
  const wasGrounded = player.grounded;
  player.reaction = Math.max(0, player.reaction - dt);
  player.coyote = player.grounded ? .1 : Math.max(0, player.coyote - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  player.vx = approach(player.vx, direction * 270, (direction ? 1450 : 1850) * dt);
  if (direction) player.facing = direction > 0 ? 1 : -1;
  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -630; player.grounded = false; player.coyote = 0; player.jumpBuffer = 0;
  }
  player.x = Math.max(20, Math.min(WORLD_WIDTH - player.width - 20, player.x + player.vx * dt));
  const previousBottom = player.y + player.height;
  player.vy = Math.min(900, player.vy + 1680 * dt);
  player.y += player.vy * dt;
  player.grounded = false;
  // One-way platforms: land only when crossing the top while falling.
  const surfaces = [...platforms, { x: 0, y: FLOOR, width: WORLD_WIDTH }];
  let landingY = Infinity;
  if (player.vy >= 0) {
    for (const surface of surfaces) {
      if (player.x + player.width > surface.x && player.x < surface.x + surface.width && previousBottom <= surface.y + .5 && player.y + player.height >= surface.y) landingY = Math.min(landingY, surface.y);
    }
  }
  if (landingY !== Infinity) { player.y = landingY - player.height; player.vy = 0; player.grounded = true; }
  const landed = !wasGrounded && player.grounded;
  if (landed) { player.reaction = .16; player.state = 'land'; }
  else if (!player.grounded) player.state = player.vy < 0 ? 'jump' : 'fall';
  else if (player.reaction <= 0) player.state = Math.abs(player.vx) > 8 ? 'walk' : 'idle';
  return landed;
}
export function nearestStation(world: World): number | null {
  const player = world.player;
  const center = player.x + player.width / 2;
  const station = STATIONS.find((station) => Math.abs(station.x - center) < 100 && Math.abs(player.y + player.height - FLOOR) < 100);
  return station?.id ?? null;
}
export function portalReady(world: World): boolean { return [0, 1, 2].every((id) => world.visited.has(id)); }
export function discover(world: World, id: number): boolean {
  if (!STATIONS.some((station) => station.id === id) || (id === 3 && !portalReady(world))) return false;
  const first = !world.visited.has(id);
  world.visited.add(id);
  world.player.state = 'interact'; world.player.reaction = .65;
  return first;
}
export function burst(world: World, x: number, y: number, count: number): void {
  for (let i = 0; i < count && world.particles.length < 60; i++) {
    const angle = -Math.PI + (i / count) * Math.PI;
    world.particles.push({ x, y, vx: Math.cos(angle) * (35 + i * 3), vy: Math.sin(angle) * 95, life: .65, maxLife: .65 });
  }
}
