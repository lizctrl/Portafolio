export interface GameControls { direction(): number; clear(): void }
interface Callbacks { jump(): void; interact(): void; canPlay(): boolean; activate(): void; escape(): void }

/** Keys are scoped to the focused game, never to document/window. */
export function bindControls(root: HTMLElement, stage: HTMLElement, callbacks: Callbacks, signal: AbortSignal): GameControls {
  const keys = new Set<string>();
  const held = new Map<number, string>();
  const tapTimers = new Set<number>();
  const left = new Set(['a', 'arrowleft']);
  const right = new Set(['d', 'arrowright']);
  const jump = new Set(['w', 'arrowup', ' ']);
  const isTyping = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable]');
  const clear = () => { keys.clear(); held.clear(); root.querySelectorAll('.is-held').forEach((el) => el.classList.remove('is-held')); };
  stage.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (isTyping(event.target) || !callbacks.canPlay()) return;
    if (left.has(key) || right.has(key) || jump.has(key) || key === 'e' || key === 'enter') {
      event.preventDefault();
      keys.add(key);
      if (!event.repeat && jump.has(key)) callbacks.jump();
      if (!event.repeat && (key === 'e' || key === 'enter')) callbacks.interact();
    }
    if (key === 'escape') { clear(); callbacks.escape(); }
  }, { signal });
  stage.addEventListener('keyup', (event) => { keys.delete(event.key.toLowerCase()); }, { signal });
  root.addEventListener('focusout', () => { queueMicrotask(() => { if (!stage.contains(document.activeElement)) keys.clear(); }); }, { signal });
  window.addEventListener('blur', clear, { signal });
  document.addEventListener('visibilitychange', clear, { signal });
  root.querySelectorAll<HTMLButtonElement>('[data-lw-control]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || button.disabled) return;
      event.preventDefault();
      callbacks.activate();
      const action = button.dataset.lwControl!;
      held.set(event.pointerId, action);
      button.setPointerCapture(event.pointerId);
      button.classList.add('is-held');
      if (action === 'jump') callbacks.jump();
      if (action === 'interact') callbacks.interact();
    }, { signal });
    const release = (event: PointerEvent) => { held.delete(event.pointerId); button.classList.remove('is-held'); };
    button.addEventListener('pointerup', release, { signal });
    button.addEventListener('pointercancel', release, { signal });
    button.addEventListener('lostpointercapture', release, { signal });
    // Enter/Space and assistive technology also work without pointer events.
    button.addEventListener('click', (event) => {
      if (event.detail !== 0) return;
      callbacks.activate();
      const action = button.dataset.lwControl!;
      if (action === 'jump') callbacks.jump();
      if (action === 'interact') callbacks.interact();
      if (action === 'left' || action === 'right') {
        const key = action === 'left' ? 'arrowleft' : 'arrowright';
        keys.add(key);
        const timer = window.setTimeout(() => { keys.delete(key); tapTimers.delete(timer); }, 140);
        tapTimers.add(timer);
      }
    }, { signal });
  });
  signal.addEventListener('abort', () => { tapTimers.forEach(clearTimeout); clear(); }, { once: true });
  return {
    direction() {
      const values = Array.from(held.values());
      return Number([...keys].some((key) => right.has(key)) || values.includes('right')) - Number([...keys].some((key) => left.has(key)) || values.includes('left'));
    },
    clear,
  };
}
