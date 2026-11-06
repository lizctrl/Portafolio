import { WORLD_HEIGHT, WORLD_WIDTH, type World } from './model';
import { createWorld, stepPlayer, nearestStation, burst, queueJump } from './physics';
import { renderWorld } from './renderer';

interface EngineOptions {
  canvas: HTMLCanvasElement;
  root: HTMLElement;
  direction(): number;
  onNear(id: number | null): void;
  reduced: MediaQueryList;
  signal: AbortSignal;
}
export interface GameEngine {
  readonly world: World;
  readonly started: boolean;
  readonly canPlay: boolean;
  start(): void;
  pause(value: boolean): void;
  reset(): void;
  jump(): void;
  redraw(): void;
  destroy(): void;
}

export function createEngine({ canvas, root, direction, onNear, reduced, signal }: EngineOptions): GameEngine {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D no está disponible');
  const ctx = context;
  let world = createWorld();
  let width = 1, height = 1, dpr = 1;
  let started = false, paused = false, visible = false, destroyed = false;
  let frame = 0, lastTime = 0, accumulator = 0, lastTrail = 0;
  const fixedStep = 1 / 120;
  function request() { if (!frame && !destroyed && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  function render() { renderWorld(ctx, world, width, height, dpr, reduced.matches); }
  function tick(now: number) {
    frame = 0;
    if (destroyed || !visible || document.hidden) { lastTime = 0; return; }
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
    lastTime = now;
    if (!paused) {
      world.time += dt;
      if (started) {
        accumulator += dt;
        while (accumulator >= fixedStep) {
          const landed = stepPlayer(world.player, direction(), fixedStep);
          if (landed && !reduced.matches) burst(world, world.player.x + 15, world.player.y + world.player.height, 7);
          accumulator -= fixedStep;
        }
        const nearest = nearestStation(world);
        if (world.nearest !== nearest) { world.nearest = nearest; onNear(nearest); }
        if (world.player.state === 'walk' && !reduced.matches && world.time - lastTrail > .14) {
          burst(world, world.player.x + 15, world.player.y + world.player.height, 1); lastTrail = world.time;
        }
        const viewWidth = width / (height / WORLD_HEIGHT);
        const target = Math.max(0, Math.min(Math.max(0, WORLD_WIDTH - viewWidth), world.player.x - viewWidth * .38));
        world.camera += (target - world.camera) * (reduced.matches ? 1 : 1 - Math.exp(-7 * dt));
      }
      for (const particle of world.particles) { particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 130 * dt; }
      world.particles = world.particles.filter((particle) => particle.life > 0);
    }
    render();
    if (!paused && (started || !reduced.matches)) request();
  }
  const resize = new ResizeObserver(() => {
    width = Math.max(1, canvas.clientWidth); height = Math.max(1, canvas.clientHeight); dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    // Draw once even when a panel has paused the loop.
    render(); request();
  });
  resize.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    root.classList.toggle('lw-visible', visible);
    lastTime = 0;
    if (visible) request();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: .05 });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', () => {
    lastTime = 0;
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else request();
  }, { signal });
  reduced.addEventListener('change', () => { render(); request(); }, { signal });
  const engine: GameEngine = {
    get world() { return world; }, get started() { return started; }, get canPlay() { return started && !paused && visible && !document.hidden; },
    start() { started = true; lastTime = 0; request(); },
    pause(value) { paused = value; lastTime = 0; accumulator = 0; if (!value) request(); else render(); },
    reset() { world = createWorld(); started = false; paused = false; lastTime = 0; accumulator = 0; lastTrail = 0; onNear(null); render(); request(); },
    jump() { if (engine.canPlay) queueJump(world.player); },
    redraw() { render(); request(); },
    destroy() { destroyed = true; cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); },
  };
  signal.addEventListener('abort', () => engine.destroy(), { once: true });
  return engine;
}
