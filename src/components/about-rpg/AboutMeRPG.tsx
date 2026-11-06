import { h } from '../../jsx';
import { Icon } from '../Icon';
import { QUESTS, type AboutData, type SkillsData, type Interaction } from './model';
import { SCENES } from './map';
import { createEngine } from './engine';
import { bindControls, type Controls } from './controls';
import { createDialogue, type DialoguePage } from './dialogue';
import { portraitURL } from './renderer';
import { discoverQuest, discoverMotivation } from './physics';
import { TECHNOLOGY_PURPOSE } from './content';
import './rpg.css';

interface Props { about: AboutData; skills: SkillsData; projectsHref: string }
let instance = 0;
export function AboutMeRPG({ about, skills, projectsHref }: Props): Node {
  const uid = `liz-rpg-${++instance}`;
  const root = (
    <div class="liz-rpg" data-liz-rpg="">
      <div class="rpg-toolbar">
        <div class="rpg-wordmark"><span class="rpg-logo" aria-hidden="true">✦</span><div><h3>LIZ'S WORLD <span>RPG ADVENTURE</span></h3><p>Un pequeño pueblo. Una historia por descubrir.</p></div></div>
        <div class="rpg-actions"><span class="rpg-progress" role="status" aria-label="Exploración: 0 de 4">Exploración <strong>0 / 4</strong></span><button type="button" class="rpg-icon-button" data-rpg-action="help" aria-label="Cómo explorar el pueblo">?</button><button type="button" class="rpg-icon-button" data-rpg-action="reset" aria-label="Reiniciar la aventura">↺</button><button type="button" class="rpg-reading-button" data-rpg-action="reader" aria-expanded="false" aria-controls={`${uid}-reader`}>Ver información sin jugar <span aria-hidden="true">↗</span></button></div>
      </div>
      <div class="rpg-stage" tabindex="0" role="group" aria-label="Mundo de Liz. Activa los controles para caminar con WASD o flechas e interactuar con E." aria-describedby={`${uid}-instructions`}>
        <canvas class="rpg-canvas" aria-hidden="true" />
        <div class="rpg-location" aria-hidden="true"><i /> <span>Plaza de bienvenida</span></div>
        <div class="rpg-intro">
          <img src={portraitURL()} width="48" height="68" alt="Liz, personaje original del pueblo" />
          <div><span class="rpg-eyebrow">BIENVENIDA A LIZ'S WORLD</span><h4>Explora mi mundo.<br />Descubre mi historia.</h4><p>Visita mi casa, explora el laboratorio y encuentra cuatro motivos para seguir creando.</p><div class="rpg-intro-actions"><button type="button" class="rpg-button rpg-primary" data-rpg-action="start">Explorar el pueblo →</button><button type="button" class="rpg-button" data-rpg-action="intro">Hablar con Liz</button></div><span class="rpg-intro-note">Sin orden obligatorio · Puedes omitir la introducción</span></div>
        </div>
        <div class="rpg-prompt" hidden><kbd>E</kbd><span>Hablar</span></div>
        <button type="button" class="rpg-resume" data-rpg-action="resume" hidden>Reanudar controles →</button>
        <dialog class="rpg-dialog" aria-modal="false" aria-labelledby={`${uid}-title`} aria-describedby={`${uid}-dialog-reader`}>
          <div class="rpg-dialog-portrait-frame"><img class="rpg-dialog-portrait" src={portraitURL()} width="48" height="68" alt="Liz" /></div>
          <div class="rpg-dialog-main"><div class="rpg-dialog-top"><span class="rpg-speaker">Liz</span><span class="rpg-dialog-page">1 / 1</span><button type="button" data-rpg-dialog="close" aria-label="Cerrar diálogo">×</button></div><h4 class="rpg-dialog-title" id={`${uid}-title`} /><p class="rpg-typed" aria-hidden="true" /><p class="rpg-sr rpg-dialog-reader" id={`${uid}-dialog-reader`} /><div class="rpg-dialog-extra" /><div class="rpg-dialog-buttons"><button type="button" data-rpg-dialog="reveal">Mostrar todo el texto</button><button type="button" data-rpg-dialog="next">Continuar →</button></div></div>
        </dialog>
      </div>
      <div class="rpg-controls-bar">
        <p id={`${uid}-instructions`}><span class="rpg-desktop-instructions"><kbd>W A S D</kbd> o <kbd>↑ ← ↓ →</kbd> caminar <span>·</span> <kbd>E</kbd> hablar / entrar <span>·</span> <kbd>Esc</kbd> salir</span><span class="rpg-touch-instructions">Mantén las flechas para caminar. Pulsa Hablar al acercarte a un objeto.</span></p>
        <button type="button" class="rpg-exit" data-rpg-action="exit" hidden>Salir de los controles ↗</button>
        <div class="rpg-touch-controls" role="group" aria-label="Controles táctiles de Liz"><div class="rpg-dpad"><button type="button" data-rpg-control="w" aria-label="Caminar hacia arriba">↑</button><button type="button" data-rpg-control="a" aria-label="Caminar a la izquierda">←</button><span aria-hidden="true">✦</span><button type="button" data-rpg-control="d" aria-label="Caminar a la derecha">→</button><button type="button" data-rpg-control="s" aria-label="Caminar hacia abajo">↓</button></div><button type="button" class="rpg-touch-interact" data-rpg-control="interact" aria-label="Interactuar con el objeto cercano" disabled><span>E</span>Hablar / entrar</button></div>
      </div>
      <div class="rpg-questbar"><span class="rpg-quest-title">MISIÓN <strong>Descubre el mundo de Liz</strong></span><div class="rpg-quest-items" role="list" aria-label="Objetivos de exploración">{QUESTS.map((quest, index) => <span role="listitem" aria-label={`${quest}: pendiente`} data-rpg-quest={index}><i aria-hidden="true">{index + 1}</i>{quest}</span>)}</div><a href={projectsHref}>Ver proyectos <span aria-hidden="true">↗</span></a></div>
      <p class="rpg-sr rpg-announcement" role="status" aria-live="polite" />
      <div class="rpg-reader" id={`${uid}-reader`} hidden><div class="rpg-reader-content"><div class="rpg-reader-bio"><img src={about.photo.src} alt={about.photo.alt} width="140" height="150" loading="lazy" /><div><span class="rpg-eyebrow">LA PERSONA DETRÁS DEL CÓDIGO</span><h4>Hola, soy Liz.</h4><p>{about.text}</p></div></div><div class="rpg-reader-columns"><article><h4>Mis intereses</h4><ul>{about.traits.map((t) => <li><Icon name={t.icon} size={20} />{t.label}</li>)}</ul><h4>{about.motivation.title}</h4><ul>{about.motivation.items.map((t) => <li><Icon name="check" size={18} />{t}</li>)}</ul></article><article><h4>Mis tecnologías</h4>{skills.groups.map((group) => <div class="rpg-reader-group"><h5>{group.title}</h5><p>{group.items.map((item) => item.name).join(' · ')}</p></div>)}</article></div><a class="rpg-button rpg-primary" href={projectsHref}>Explorar mis proyectos ↗</a><button type="button" class="rpg-button" data-rpg-action="close-reader">Volver al pueblo ↑</button></div></div>
    </div>
  ) as HTMLElement;
  const abort = new AbortController(), { signal } = abort;
  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const stage = $<HTMLElement>('.rpg-stage'), canvas = $<HTMLCanvasElement>('canvas');
  const intro = $<HTMLElement>('.rpg-intro'), reader = $<HTMLElement>('.rpg-reader'), readerButton = $<HTMLButtonElement>('[data-rpg-action="reader"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let controls: Controls | undefined, controlMode = false, reading = false;
  const timers = new Set<number>();
  function announce(text: string) { $<HTMLElement>('.rpg-announcement').textContent = text; }
  function updateProgress() {
    const state = engine.state;
    $<HTMLElement>('.rpg-progress strong').textContent = `${state.quests.size} / 4`;
    $<HTMLElement>('.rpg-progress').setAttribute('aria-label', `Exploración: ${state.quests.size} de 4. Motivaciones: ${state.motives.size} de 4.`);
    QUESTS.forEach((quest, index) => { const item = $<HTMLElement>(`[data-rpg-quest="${index}"]`); const done = state.quests.has(index); item.classList.toggle('rpg-done', done); item.setAttribute('aria-label', `${quest}: ${done ? 'completado' : 'pendiente'}`); });
    root.classList.toggle('rpg-complete', state.quests.size === 4);
    engine.redraw();
  }
  function markQuest(id: number) { const first = discoverQuest(engine.state, id); if (first) { updateProgress(); announce(`${QUESTS[id]}. Objetivo descubierto. Exploración: ${engine.state.quests.size} de 4.`); } }
  function updateNear(item: Interaction | null) {
    const prompt = $<HTMLElement>('.rpg-prompt'); prompt.hidden = !item || !controlMode || dialogue.isOpen || reading;
    if (item) { prompt.querySelector('span')!.textContent = item.label; if (controlMode) announce(`${item.label}. Pulsa E o Hablar para interactuar.`); }
    $<HTMLButtonElement>('[data-rpg-control="interact"]').disabled = !item || !controlMode || dialogue.isOpen || reading;
  }
  const engine = createEngine({ root, canvas, input: () => controlMode ? controls?.input() ?? { x: 0, y: 0 } : { x: 0, y: 0 }, onNear: updateNear, reduced, signal });
  function pause() { engine.pause(dialogue.isOpen || reading); controls?.clear(); updateNear(SCENES[engine.state.scene].interactions.find((i) => i.id === engine.state.nearest) ?? null); }
  const dialogue = createDialogue({ dialog: $<HTMLDialogElement>('dialog'), signal, reduced, onOpen: pause, onClose: pause });
  function activate() {
    if (reading || dialogue.isOpen) return;
    controlMode = true; intro.hidden = true; $<HTMLElement>('[data-rpg-action="resume"]').hidden = true; $<HTMLElement>('[data-rpg-action="exit"]').hidden = false;
    engine.start(); stage.focus({ preventScroll: true }); updateNear(SCENES[engine.state.scene].interactions.find((i) => i.id === engine.state.nearest) ?? null);
  }
  function exitControls() { controlMode = false; controls?.clear(); engine.state.player.moving = false; $<HTMLElement>('[data-rpg-action="exit"]').hidden = true; $<HTMLElement>('[data-rpg-action="resume"]').hidden = !engine.started; updateNear(null); readerButton.focus({ preventScroll: true }); announce('Controles desactivados. Puedes continuar navegando por el portafolio.'); }
  function open(pages: DialoguePage[]) { controls?.clear(); engine.state.player.interact = .4; dialogue.open(pages, stage); }
  function page(title: string, text: string, onReveal?: () => void, speaker = 'Liz', variant = 0): DialoguePage { return { title, text, speaker, portrait: portraitURL(variant), onReveal }; }
  function welcome() { open([page("Bienvenido a Liz's World", '¡Hola! Soy Liz. Bienvenido a mi pequeño mundo digital. Aquí podrás descubrir quién soy y qué me apasiona crear. Camina con las flechas o WASD, y usa E para hablar con los personajes y entrar en los edificios.'), page('¿Quién soy?', about.text, () => markQuest(0))]); }
  function technologies(index: number) {
    const group = skills.groups[index];
    const description = <p class="rpg-tool-description" role="status">Selecciona una herramienta para conocer su función.</p> as HTMLElement;
    const cards = <div class="rpg-tool-cards">{group.items.map((item) => <button type="button" aria-pressed="false" aria-label={`Ver función de ${item.name}`} onclick={(event: Event) => { const b = event.currentTarget as HTMLButtonElement; b.parentElement!.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el === b))); description.textContent = `${item.name}: ${TECHNOLOGY_PURPOSE[item.name] ?? 'Una de las tecnologías de mi portafolio.'}`; }}>{item.name}</button>)}</div>;
    const body = <div>{cards}{description}</div> as HTMLElement;
    const entry = page(group.title, 'Estas son las tecnologías de esta parte de mi stack. Puedes abrir cada tarjeta para descubrir qué aporta.', () => { engine.state.visits.add(`terminal-${index}`); markQuest(1); }, 'Laboratorio', 2);
    entry.content = body; open([entry]);
  }
  function interact() {
    if (!engine.active || !controlMode || dialogue.isOpen || reading) return;
    const item = SCENES[engine.state.scene].interactions.find((i) => i.id === engine.state.nearest);
    if (!item) return;
    if (item.kind === 'enter-home' || item.kind === 'enter-lab' || item.kind === 'exit') {
      controls?.clear(); engine.enter(item.kind === 'exit' ? 'village' : item.kind === 'enter-home' ? 'home' : 'lab');
      $<HTMLElement>('.rpg-location span').textContent = SCENES[engine.state.scene].title;
      root.classList.add('rpg-scene-change'); const timer = window.setTimeout(() => { root.classList.remove('rpg-scene-change'); timers.delete(timer); }, 200); timers.add(timer);
      announce(`Has entrado en ${SCENES[engine.state.scene].title}.`); return;
    }
    if (item.kind === 'welcome') welcome();
    else if (item.kind === 'sign') open([page("Bienvenido a Liz's World", 'La casa de Liz está al noroeste. El laboratorio, al noreste. El jardín de las motivaciones, al suroeste. El portal de proyectos, al sureste. Puedes explorar en cualquier orden y leer toda la información sin jugar.', undefined, 'Guía del pueblo', 2)]);
    else if (item.kind === 'bio') open([page('¿Quién soy?', about.text, () => markQuest(0))]);
    else if (item.kind === 'interests') open([page('Mis habilidades e intereses', about.traits.map((t) => t.label).join('. ') + '. En este laboratorio encontrarás cuatro terminales: Frontend, Backend, Bases de datos y Herramientas. Acércate a cada ordenador y pulsa E para explorar su contenido.', () => markQuest(1), 'Laboratorio', 2)]);
    else if (item.kind === 'technology') technologies(item.index!);
    else if (item.kind === 'gardener') open([page('Un jardín de ideas', `Cada cristal guarda una motivación. Acércate a los cuatro pedestales para descubrir lo que inspira a Liz. Has encontrado ${engine.state.motives.size} de 4.`, undefined, 'La jardinera', 1)]);
    else if (item.kind === 'motivation') open([page('¿Qué me motiva?', about.motivation.items[item.index!], () => { const first = discoverMotivation(engine.state, item.index!); engine.state.visits.add(item.id); updateProgress(); if (first) announce(`Motivación descubierta. ${engine.state.motives.size} de 4 cristales del jardín.`); }, 'Cristal de ideas', 1)]);
    else if (item.kind === 'portal') {
      const portal = page('El siguiente capítulo', '¡Has explorado mi mundo! Ahora descubre lo que he construido. Puedes visitar mis proyectos cuando quieras; no necesitas completar la exploración.', () => markQuest(3), 'Portal de proyectos');
      portal.content = <div><a class="rpg-button rpg-primary" href={projectsHref} onclick={() => dialogue.close(false)}>Explorar mis proyectos ↗</a><p class="rpg-portal-note">{engine.state.quests.size === 4 || [0, 1, 2].every((id) => engine.state.quests.has(id)) ? '✦ Exploración completada. ¡Gracias por conocer mi mundo!' : 'El camino hacia mis proyectos siempre está abierto.'}</p></div> as HTMLElement; open([portal]);
    }
  }
  controls = bindControls(root, stage, { active: () => engine.active && controlMode && !dialogue.isOpen && !reading, activate, interact, exit: exitControls }, signal);
  $<HTMLButtonElement>('[data-rpg-action="start"]').addEventListener('click', activate, { signal });
  $<HTMLButtonElement>('[data-rpg-action="intro"]').addEventListener('click', () => { activate(); welcome(); }, { signal });
  $<HTMLButtonElement>('[data-rpg-action="resume"]').addEventListener('click', activate, { signal });
  $<HTMLButtonElement>('[data-rpg-action="exit"]').addEventListener('click', exitControls, { signal });
  stage.addEventListener('pointerdown', (event) => { if ((event.target as HTMLElement).closest('button, dialog') || !engine.started) return; activate(); }, { signal });
  stage.addEventListener('focusout', () => queueMicrotask(() => { if (!stage.contains(document.activeElement) && engine.started && !reading && !dialogue.isOpen) { controlMode = false; controls?.clear(); $<HTMLElement>('[data-rpg-action="resume"]').hidden = false; $<HTMLElement>('[data-rpg-action="exit"]').hidden = true; updateNear(null); } }), { signal });
  readerButton.addEventListener('click', () => {
    dialogue.close(false); reading = !reading; reader.hidden = !reading; readerButton.setAttribute('aria-expanded', String(reading)); readerButton.textContent = reading ? 'Cerrar lectura y volver al pueblo ↑' : 'Ver información sin jugar ↗';
    controls?.clear(); pause(); if (reading) reader.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' }); else { stage.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'center' }); if (engine.started) activate(); else $<HTMLButtonElement>('[data-rpg-action="start"]').focus({ preventScroll: true }); }
  }, { signal });
  $<HTMLButtonElement>('[data-rpg-action="close-reader"]').addEventListener('click', () => readerButton.click(), { signal });
  $<HTMLButtonElement>('[data-rpg-action="help"]').addEventListener('click', () => {
    const help = page('Tu visita, a tu ritmo', 'Usa WASD o las flechas para caminar. Al acercarte a una puerta, un personaje, un ordenador o un cristal, aparecerá E. Pulsa E o Enter para interactuar. En móvil, mantén las flechas del control direccional. Puedes revelar el texto de golpe, cerrar con Escape o salir de los controles para navegar por la página.', undefined, 'Guía del pueblo', 2);
    help.content = <div class="rpg-help-map"><span>↖ Casa de Liz</span><span>↗ Laboratorio</span><span>↙ Jardín · 4 cristales</span><span>↘ Portal de proyectos</span><p>La misión es opcional. El portal y la lectura sin jugar están disponibles desde el inicio.</p></div> as HTMLElement;
    dialogue.open([help], $<HTMLButtonElement>('[data-rpg-action="help"]'));
  }, { signal });
  $<HTMLButtonElement>('[data-rpg-action="reset"]').addEventListener('click', () => {
    dialogue.close(false); controls?.clear(); reading = false; reader.hidden = true; readerButton.setAttribute('aria-expanded', 'false'); readerButton.textContent = 'Ver información sin jugar ↗'; controlMode = false;
    engine.reset(); updateProgress(); intro.hidden = false; $<HTMLElement>('[data-rpg-action="resume"]').hidden = true; $<HTMLElement>('[data-rpg-action="exit"]').hidden = true; $<HTMLElement>('.rpg-location span').textContent = 'Plaza de bienvenida';
    $<HTMLButtonElement>('[data-rpg-action="start"]').focus({ preventScroll: true }); announce('Aventura reiniciada. Exploración: 0 de 4.');
  }, { signal });
  let connected = false;
  const removal = new MutationObserver(() => { if (root.isConnected) connected = true; else if (connected) { removal.disconnect(); abort.abort(); } });
  removal.observe(document, { childList: true, subtree: true }); queueMicrotask(() => { connected = root.isConnected; });
  signal.addEventListener('abort', () => { removal.disconnect(); timers.forEach(clearTimeout); }, { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => abort.abort());
  return root;
}
