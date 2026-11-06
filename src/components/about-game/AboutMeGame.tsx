import { h } from '../../jsx';
import { Icon } from '../Icon';
import { STATIONS, type AboutData } from './model';
import { createEngine } from './engine';
import { bindControls, type GameControls } from './controls';
import { burst, discover, portalReady } from './physics';
import './game.css';

interface AboutMeGameProps { data: AboutData; projectsHref: string }
let instance = 0;

export function AboutMeGame({ data, projectsHref }: AboutMeGameProps): Node {
  const uid = `liz-world-${++instance}`;
  const game = (
    <div class="liz-world" data-liz-world="">
      <div class="lw-hud">
        <div class="lw-brand"><span class="lw-brand-icon" aria-hidden="true">L<span>W</span></span><div><h3>LIZ'S WORLD<span class="lw-version">01</span></h3><span class="lw-level">EXPLORE MY WORLD. DISCOVER MY STORY.</span></div></div>
        <div class="lw-hud-right">
          <div class="lw-progress" role="status" aria-label="Progreso del recorrido"><span class="lw-progress-count">0 <span>/ 4</span></span><div class="lw-progress-dots" aria-hidden="true">{STATIONS.map((s) => <i data-lw-dot={s.id} />)}</div></div>
          <button type="button" class="lw-icon-button" data-lw-action="help" aria-label="Cómo jugar" title="Cómo jugar">?</button>
          <button type="button" class="lw-icon-button" data-lw-action="reset" aria-label="Reiniciar recorrido" title="Reiniciar recorrido">↺</button>
        </div>
      </div>
      <div class="lw-stage" tabindex="0" role="group" aria-label="LIZ'S WORLD, escenario de plataformas. Activa el juego para usar el teclado." aria-describedby={`${uid}-instructions`}>
        <canvas class="lw-canvas" aria-hidden="true" />
        <span class="lw-stage-label" aria-hidden="true">LEVEL 01 <span>—</span> ABOUT ME</span>
        <div class="lw-splash">
          <div class="lw-splash-copy">
            <span class="lw-eyebrow">UN PEQUEÑO MUNDO POR DESCUBRIR</span>
            <h4>Mi historia,<br /><em>a tu ritmo.</em></h4>
            <p>Acompaña a Liz por cuatro estaciones y conoce lo que hay detrás del código.</p>
            <button type="button" class="lw-button lw-button-primary" data-lw-action="start">Entrar a mi mundo <span aria-hidden="true">→</span></button>
            <span class="lw-splash-note">Sin prisa. Sin perder. Solo explorar.</span>
          </div>
          <div class="lw-splash-orbit" aria-hidden="true"><span>&lt;/&gt;</span><i /><i /></div>
        </div>
        <div class="lw-stage-prompt" hidden><kbd>E</kbd><span>Acércate a una estación</span></div>
        <div class="lw-off-focus" hidden><button type="button" class="lw-button" data-lw-action="resume">Continuar explorando →</button></div>
      </div>
      <div class="lw-control-strip">
        <p id={`${uid}-instructions`} class="lw-instructions"><span class="lw-instruction-desktop"><kbd>←</kbd><kbd>→</kbd> mover <span>·</span> <kbd>Espacio</kbd> saltar <span>·</span> <kbd>E</kbd> descubrir</span><span class="lw-instruction-touch">Mantén las flechas para caminar. Salta y descubre a tu ritmo.</span></p>
        <div class="lw-touch-controls" role="group" aria-label="Controles del personaje">
          <div><button type="button" data-lw-control="left" aria-label="Mover a la izquierda">←</button><button type="button" data-lw-control="right" aria-label="Mover a la derecha">→</button></div>
          <div><button type="button" data-lw-control="jump" aria-label="Saltar">↑ <span>Saltar</span></button><button type="button" data-lw-control="interact" aria-label="Descubrir estación cercana" disabled>E <span>Descubrir</span></button></div>
        </div>
      </div>
      <div class="lw-bottom">
        <div class="lw-station-map" role="list" aria-label="Estaciones del recorrido">{STATIONS.map((s) => <span role="listitem" data-lw-map={s.id}><i aria-hidden="true">{String(s.id + 1).padStart(2, '0')}</i>{s.label}</span>)}</div>
        <button type="button" class="lw-reader-toggle" data-lw-action="reader" aria-expanded="false" aria-controls={`${uid}-reader`}>Ver información sin jugar <span aria-hidden="true">↗</span></button>
      </div>
      <p class="lw-announcement sr-only" role="status" aria-live="polite" />
      <div class="lw-reader" id={`${uid}-reader`} hidden>
        <div class="lw-reader-intro"><img src={data.photo.src} alt={data.photo.alt} width="160" height="170" loading="lazy" /><div><span class="lw-eyebrow">01 / WHO AM I?</span><h4>Hola, soy Liz.</h4><p>{data.text}</p></div></div>
        <div class="lw-reader-columns"><article><span class="lw-eyebrow">02 / WHAT I LOVE</span><h4>Lo que me apasiona</h4><ul>{data.traits.map((trait) => <li><Icon name={trait.icon} size={20} />{trait.label}</li>)}</ul></article><article><span class="lw-eyebrow">03 / WHAT DRIVES ME</span><h4>{data.motivation.title}</h4><ul>{data.motivation.items.map((item) => <li><Icon name="check" size={18} />{item}</li>)}</ul></article></div>
        <a class="lw-button" href={projectsHref}>Explorar mis proyectos <span aria-hidden="true">↗</span></a>
      </div>
      <dialog class="lw-dialog" aria-labelledby={`${uid}-dialog-title`}><div class="lw-dialog-inner" /></dialog>
    </div>
  ) as HTMLElement;
  const abort = new AbortController();
  const { signal } = abort;
  const query = <T extends HTMLElement>(selector: string) => game.querySelector<T>(selector)!;
  const stage = query<HTMLElement>('.lw-stage');
  const dialog = query<HTMLDialogElement>('.lw-dialog');
  const reader = query<HTMLElement>('.lw-reader');
  const splash = query<HTMLElement>('.lw-splash');
  const prompt = query<HTMLElement>('.lw-stage-prompt');
  const offFocus = query<HTMLElement>('.lw-off-focus');
  const interactButton = query<HTMLButtonElement>('[data-lw-control="interact"]');
  const readerButton = query<HTMLButtonElement>('[data-lw-action="reader"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let controls: GameControls | undefined;
  let restoreFocus: HTMLElement | null = null;
  let readerOpen = false;

  function announce(text: string) { query<HTMLElement>('.lw-announcement').textContent = text; }
  function updateProgress() {
    const count = engine.world.visited.size;
    query<HTMLElement>('.lw-progress-count').replaceChildren(h('span', null, `${count} `), h('span', null, '/ 4'));
    query<HTMLElement>('.lw-progress').setAttribute('aria-label', `${count} de 4 estaciones descubiertas${count === 4 ? '. Recorrido completado' : ''}`);
    STATIONS.forEach((s) => {
      const done = engine.world.visited.has(s.id);
      query<HTMLElement>(`[data-lw-dot="${s.id}"]`).classList.toggle('is-found', done);
      query<HTMLElement>(`[data-lw-map="${s.id}"]`).classList.toggle('is-found', done);
    });
    game.classList.toggle('lw-complete', count === 4);
  }
  function updateNear(id: number | null) {
    interactButton.disabled = id === null || !engine.started;
    STATIONS.forEach((s) => query<HTMLElement>(`[data-lw-map="${s.id}"]`).classList.toggle('is-near', id === s.id));
    const station = STATIONS.find((s) => s.id === id);
    prompt.hidden = !station || !engine.started;
    if (station) {
      const label = station.id === 3 && !portalReady(engine.world) ? 'El portal te espera · E para ver' : `${engine.world.visited.has(station.id) ? 'Volver a ver' : 'Descubrir'}: ${station.label}`;
      prompt.querySelector('span')!.textContent = label;
      announce(`${station.label}. Pulsa E o Descubrir para interactuar.`);
    }
  }
  const engine = createEngine({ canvas: query<HTMLCanvasElement>('.lw-canvas'), root: game, direction: () => controls?.direction() ?? 0, onNear: updateNear, reduced, signal });
  function syncPause() { engine.pause(dialog.open || readerOpen); }
  function activate() {
    if (dialog.open || readerOpen) return;
    splash.hidden = true; offFocus.hidden = true;
    engine.start(); stage.focus({ preventScroll: true }); game.classList.add('lw-started');
  }
  function openPanel(title: string, body: Node, eyebrow: string, icon: 'monitor' | 'layers' | 'sparkles' | 'rocket' | 'code') {
    controls?.clear();
    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : stage;
    query<HTMLElement>('.lw-dialog-inner').replaceChildren(
      h('div', { class: 'lw-panel-top' }, h('span', { class: 'lw-panel-symbol' }, h(Icon, { name: icon, size: 26 })), h('button', { type: 'button', class: 'lw-icon-button', 'aria-label': 'Cerrar panel', onclick: () => dialog.close() }, '×')),
      h('span', { class: 'lw-eyebrow' }, eyebrow), h('h4', { id: `${uid}-dialog-title` }, title), body,
    );
    dialog.showModal(); syncPause();
    dialog.querySelector<HTMLButtonElement>('button')!.focus();
  }
  function interact() {
    if (!engine.canPlay || engine.world.nearest === null) return;
    const id = engine.world.nearest;
    const station = STATIONS[id];
    const first = discover(engine.world, id);
    if (first && !reduced.matches) burst(engine.world, station.x, 365, id === 3 ? 30 : 13);
    updateProgress();
    if (first) announce(`${station.label} descubierta. ${engine.world.visited.size} de 4 estaciones.`);
    let body: Node;
    if (id === 0) body = <div class="lw-panel-bio"><img src={data.photo.src} alt={data.photo.alt} width="96" height="104" /><p>{data.text}</p></div>;
    else if (id === 1) body = <ul class="lw-discover-list">{data.traits.map((trait, i) => <li style={`--lw-index:${i}`}><Icon name={trait.icon} size={24} /><span>{trait.label}</span></li>)}</ul>;
    else if (id === 2) body = <ul class="lw-discover-list">{data.motivation.items.map((item, i) => <li style={`--lw-index:${i}`}><Icon name="check" size={20} /><span>{item}</span></li>)}</ul>;
    else if (!portalReady(engine.world)) body = <div><p>Este es el siguiente capítulo. Descubre primero las otras tres estaciones para encender el portal.</p><p class="lw-panel-note">Te faltan {3 - engine.world.visited.size} estaciones. Puedes explorarlas en cualquier orden.</p></div>;
    else body = <div class="lw-finale"><span class="lw-finale-mark" aria-hidden="true">✦</span><p>¡Has descubierto mi mundo! Ahora te invito a conocer lo que puedo construir.</p><a class="lw-button lw-button-primary" href={projectsHref} onclick={() => dialog.close()}>Explorar mis proyectos <span aria-hidden="true">↗</span></a><span class="lw-panel-note">Recorrido completado · 4 de 4</span></div>;
    openPanel(id === 0 ? 'La persona detrás del código.' : id === 1 ? 'Lo que me apasiona.' : id === 2 ? 'Lo que me mueve.' : portalReady(engine.world) ? 'El siguiente nivel empieza aquí.' : 'Cada historia tiene su recorrido.', body, `${String(id + 1).padStart(2, '0')} / ${station.title}`, id === 0 ? 'monitor' : id === 1 ? 'layers' : id === 2 ? 'sparkles' : 'rocket');
  }
  controls = bindControls(game, stage, { jump: () => engine.jump(), interact, canPlay: () => engine.canPlay, activate, escape: () => { stage.blur(); } }, signal);
  query<HTMLButtonElement>('[data-lw-action="start"]').addEventListener('click', activate, { signal });
  query<HTMLButtonElement>('[data-lw-action="resume"]').addEventListener('click', activate, { signal });
  stage.addEventListener('pointerdown', (event) => { if ((event.target as HTMLElement).closest('button') || !engine.started) return; stage.focus({ preventScroll: true }); }, { signal });
  stage.addEventListener('focusin', () => { offFocus.hidden = true; }, { signal });
  stage.addEventListener('focusout', () => queueMicrotask(() => {
    if (!stage.contains(document.activeElement) && engine.started && !dialog.open && !readerOpen) offFocus.hidden = false;
  }), { signal });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!first) return;
    if (focusable.length === 1 || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }, { signal });
  dialog.addEventListener('close', () => { syncPause(); controls?.clear(); restoreFocus?.focus({ preventScroll: true }); updateNear(engine.world.nearest); }, { signal });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } }, { signal });
  query<HTMLButtonElement>('[data-lw-action="help"]').addEventListener('click', () => {
    openPanel('Explora a tu ritmo.', <div class="lw-help-copy"><p>Acércate a los objetos luminosos y pulsa <kbd>E</kbd> o <kbd>Enter</kbd> para descubrir cada estación.</p><ul><li><strong>A / D o ← / →</strong><span>Caminar</span></li><li><strong>W / ↑ / Espacio</strong><span>Saltar</span></li><li><strong>Escape</strong><span>Cerrar el panel o salir del teclado del juego</span></li></ul><p>En móvil, mantén pulsadas las flechas y usa Saltar o Descubrir. El teclado solo controla el juego cuando el escenario tiene el foco.</p><p>También puedes elegir «Ver información sin jugar». No hay vidas, cronómetro ni obstáculos obligatorios.</p></div>, 'HOW TO PLAY', 'code');
  }, { signal });
  readerButton.addEventListener('click', () => {
    readerOpen = !readerOpen; reader.hidden = !readerOpen; readerButton.setAttribute('aria-expanded', String(readerOpen));
    readerButton.replaceChildren(document.createTextNode(readerOpen ? 'Volver al juego ' : 'Ver información sin jugar '), h('span', { 'aria-hidden': true }, readerOpen ? '↑' : '↗'));
    controls?.clear(); syncPause();
    if (!readerOpen && engine.started) stage.focus({ preventScroll: true });
  }, { signal });
  query<HTMLButtonElement>('[data-lw-action="reset"]').addEventListener('click', () => {
    if (dialog.open) dialog.close();
    readerOpen = false; reader.hidden = true; readerButton.setAttribute('aria-expanded', 'false'); readerButton.textContent = 'Ver información sin jugar ↗';
    controls?.clear(); engine.reset(); splash.hidden = false; offFocus.hidden = true; prompt.hidden = true; game.classList.remove('lw-started');
    updateProgress(); announce('Recorrido reiniciado. 0 de 4 estaciones.');
    query<HTMLButtonElement>('[data-lw-action="start"]').focus({ preventScroll: true });
  }, { signal });
  // Dispose observers and listeners if the component is removed or hot-reloaded.
  let wasConnected = false;
  const removal = new MutationObserver(() => {
    if (game.isConnected) wasConnected = true;
    else if (wasConnected) { removal.disconnect(); abort.abort(); }
  });
  removal.observe(document, { childList: true, subtree: true });
  queueMicrotask(() => { wasConnected = game.isConnected; });
  signal.addEventListener('abort', () => { removal.disconnect(); if (dialog.open) dialog.close(); }, { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => abort.abort());
  return game;
}
