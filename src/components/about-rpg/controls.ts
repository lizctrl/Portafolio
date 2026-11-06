import type { Point } from './model';

interface Actions { active(): boolean; activate(): void; interact(): void; exit(): void }
export interface Controls { input(): Point; clear(): void; destroy(): void }
export function bindControls(root: HTMLElement, stage: HTMLElement, actions: Actions, signal: AbortSignal): Controls {
  const keys = new Set<string>(), pointers = new Map<number, string>(), timers = new Set<number>();
  const directions: Record<string, Point> = { w: { x: 0, y: -1 }, arrowup: { x: 0, y: -1 }, s: { x: 0, y: 1 }, arrowdown: { x: 0, y: 1 }, a: { x: -1, y: 0 }, arrowleft: { x: -1, y: 0 }, d: { x: 1, y: 0 }, arrowright: { x: 1, y: 0 } };
  const clear = () => { keys.clear(); pointers.clear(); root.querySelectorAll('.rpg-held').forEach((b) => b.classList.remove('rpg-held')); };
  stage.addEventListener('keydown', (e) => {
    if (!actions.active() || (e.target as HTMLElement).closest('button, a, input, dialog')) return;
    const key = e.key.toLowerCase();
    if (directions[key]) { e.preventDefault(); keys.add(key); }
    if (key === 'e' || key === 'enter') { e.preventDefault(); if (!e.repeat) actions.interact(); }
    if (key === 'escape') { e.preventDefault(); clear(); actions.exit(); }
  }, { signal });
  stage.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()), { signal });
  stage.addEventListener('focusout', () => queueMicrotask(() => { if (!stage.contains(document.activeElement)) keys.clear(); }), { signal });
  window.addEventListener('blur', clear, { signal });
  document.addEventListener('visibilitychange', clear, { signal });
  root.querySelectorAll<HTMLButtonElement>('[data-rpg-control]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || button.disabled) return;
      event.preventDefault(); actions.activate();
      if (!actions.active()) return;
      const action = button.dataset.rpgControl!;
      pointers.set(event.pointerId, action); button.setPointerCapture(event.pointerId); button.classList.add('rpg-held');
      if (action === 'interact') actions.interact();
    }, { signal });
    const release = (e: PointerEvent) => { pointers.delete(e.pointerId); button.classList.remove('rpg-held'); };
    button.addEventListener('pointerup', release, { signal }); button.addEventListener('pointercancel', release, { signal }); button.addEventListener('lostpointercapture', release, { signal });
    button.addEventListener('click', (e) => {
      if (e.detail !== 0) return;
      actions.activate(); if (!actions.active()) return;
      const action = button.dataset.rpgControl!;
      if (action === 'interact') actions.interact();
      else { keys.add(action); const timer = window.setTimeout(() => { keys.delete(action); timers.delete(timer); }, 170); timers.add(timer); }
    }, { signal });
  });
  const destroy = () => { timers.forEach(clearTimeout); clear(); };
  signal.addEventListener('abort', destroy, { once: true });
  return { input() { const values = new Set([...keys, ...pointers.values()]); let x = 0, y = 0; for (const key of values) if (directions[key]) { x += directions[key].x; y += directions[key].y; } return { x: Math.sign(x), y: Math.sign(y) }; }, clear, destroy };
}
