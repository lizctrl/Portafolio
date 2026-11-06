import { SCENES } from './map';
import { createRPG, movePlayer, nearestInteraction, changeScene } from './physics';
import { renderRPG } from './renderer';
import type { Point, RPGState, SceneId, Interaction } from './model';

interface Options { root: HTMLElement; canvas: HTMLCanvasElement; input(): Point; onNear(item: Interaction | null): void; reduced: MediaQueryList; signal: AbortSignal }
export interface Engine { readonly state: RPGState; readonly active: boolean; readonly started: boolean; start(): void; pause(value: boolean): void; reset(): void; enter(id: SceneId): void; redraw(): void }
export function createEngine(options: Options): Engine {
  const { root, canvas, input, onNear, reduced, signal } = options;
  const ctx = canvas.getContext('2d')!;
  let state = createRPG(), started = false, paused = false, visible = false, destroyed = false;
  let width = 1, height = 1, frame = 0, previous = 0, snapshot = 0;
  function camera(snap = false, dt = 0) {
    const map = SCENES[state.scene];
    const target = { x: map.width < width ? (map.width - width) / 2 : Math.max(0, Math.min(map.width - width, state.player.x - width / 2)), y: map.height < height ? (map.height - height) / 2 : Math.max(0, Math.min(map.height - height, state.player.y - height * (started ? .6 : .85))) };
    const amount = snap || reduced.matches ? 1 : 1 - Math.exp(-9 * dt);
    state.camera.x += (target.x - state.camera.x) * amount; state.camera.y += (target.y - state.camera.y) * amount;
  }
  function render() { renderRPG(ctx, state, width, height, reduced.matches); }
  function request() { if (!frame && !destroyed && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  function updateSnapshot() {
    const stage = canvas.parentElement!;
    stage.dataset.scene = state.scene; stage.dataset.playerX = state.player.x.toFixed(1); stage.dataset.playerY = state.player.y.toFixed(1); stage.dataset.facing = state.player.facing;
    stage.dataset.near = state.nearest ?? '';
    const p = state.player;
    const area = state.scene !== 'village' ? SCENES[state.scene].title : p.y > 450 ? p.x < 450 ? 'Jardín de las motivaciones' : p.x > 650 ? 'Portal de proyectos' : 'Sendero del pueblo' : p.y < 300 ? p.x < 400 ? 'Casa de Liz' : p.x > 650 ? 'Laboratorio tecnológico' : 'El estanque' : 'Plaza de bienvenida';
    const label = root.querySelector<HTMLElement>('.rpg-location span');
    if (label && label.textContent !== area) label.textContent = area;
  }
  function tick(now: number) {
    frame = 0;
    if (!visible || document.hidden || destroyed) { previous = 0; return; }
    const dt = previous ? Math.min(.04, (now - previous) / 1000) : 0; previous = now;
    if (!paused) {
      state.time += dt;
      if (started) {
        movePlayer(state, input(), dt);
        const near = nearestInteraction(state);
        if (near?.id !== state.nearest && !(near === null && state.nearest === null)) { state.nearest = near?.id ?? null; onNear(near); }
        camera(false, dt);
      }
      if (!reduced.matches) for (const p of state.particles) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      else state.particles = [];
      state.particles = state.particles.filter((p) => p.age < p.life);
    }
    if (now - snapshot > 90) { updateSnapshot(); snapshot = now; }
    render();
    if (!paused && (started || !reduced.matches)) request();
  }
  const resize = new ResizeObserver(() => {
    width = Math.max(1, Math.floor(canvas.clientWidth / 2)); height = Math.max(1, Math.floor(canvas.clientHeight / 2));
    canvas.width = width; canvas.height = height; camera(true); render(); updateSnapshot(); request();
  });
  resize.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting; previous = 0;
    if (visible) request(); else { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: .04 }); observer.observe(canvas);
  document.addEventListener('visibilitychange', () => { previous = 0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else request(); }, { signal });
  reduced.addEventListener('change', () => { state.particles = []; render(); request(); }, { signal });
  signal.addEventListener('abort', () => { destroyed = true; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); }, { once: true });
  const engine: Engine = {
    get state() { return state; }, get active() { return started && !paused && visible && !document.hidden; }, get started() { return started; },
    start() { started = true; previous = 0; request(); },
    pause(value) { paused = value; state.player.moving = false; previous = 0; if (!value) request(); else render(); },
    reset() { state = createRPG(); started = false; paused = false; previous = 0; camera(true); onNear(null); updateSnapshot(); render(); request(); },
    enter(id) { changeScene(state, id); camera(true); onNear(null); updateSnapshot(); render(); request(); },
    redraw() { updateSnapshot(); render(); request(); },
  };
  return engine;
}
