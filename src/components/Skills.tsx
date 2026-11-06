import { h } from '../jsx';
import type { content } from '../content';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { logos, descriptions } from './TechCard';

interface SkillsProps { data: typeof content.skills }
type Point = { x: number; y: number; z: number };

export function Skills({ data }: SkillsProps): Node {
  const centers: Point[] = [
    { x: -235, y: -135, z: 45 }, { x: 235, y: -135, z: -45 },
    { x: 235, y: 135, z: 45 }, { x: -235, y: 135, z: -45 },
  ];
  const nodes = data.groups.flatMap((group, gi) => group.items.map((tech, i) => {
    const angle = (i / group.items.length) * Math.PI * 2 - Math.PI / 2;
    return { ...tech, group: gi, point: {
      x: centers[gi].x + Math.cos(angle) * 110,
      y: centers[gi].y + Math.sin(angle) * 80,
      z: centers[gi].z + (i % 2 ? 55 : -55),
    } };
  }));
  const section = (
    <Section id="habilidades" class="skills constellation-section">
      <SectionHeading badge={data.badge} title="Mi constelación tecnológica" subtitle="Cada herramienta es una estrella. Explora cómo se conectan." />
      <div class="constellation-shell">
        <div class="constellation-toolbar">
          <span class="constellation-caption">14 tecnologías · 4 constelaciones</span>
          <div class="constellation-tools" role="group" aria-label="Controles de la cámara">
            <button type="button" data-camera="out" aria-label="Alejar">−</button>
            <span class="constellation-zoom" aria-label="Nivel de zoom">100%</span>
            <button type="button" data-camera="in" aria-label="Acercar">+</button>
            <button type="button" data-camera="reset" aria-label="Restablecer cámara">Restablecer</button>
          </div>
        </div>
        <div class="constellation-viewport" tabindex="0" role="group" aria-label="Constelación 3D. Arrastra para girar, usa la rueda para acercar o las flechas del teclado para rotar." aria-describedby="constellation-help">
          <canvas class="constellation-canvas" aria-hidden="true" />
          {nodes.map((tech) => (
            <button type="button" class="constellation-node" data-tech={tech.name} aria-label={`${tech.name}, ${data.groups[tech.group].title}. Ver descripción.`} aria-pressed="false">
              <span class="constellation-star"><img src={`/logos/${logos[tech.name]}.svg`} width="26" height="26" alt="" draggable="false" /></span>
              <span class="constellation-node-name">{tech.name}</span>
            </button>
          ))}
        </div>
        <p id="constellation-help" class="constellation-help">Arrastra para girar · Rueda o + / − para acercar · Selecciona una estrella</p>
        <div class="constellation-detail" aria-live="polite">
          <div class="constellation-selected-logo" hidden><img width="64" height="64" alt="" /></div>
          <div><span class="constellation-selected-category">Explora las conexiones</span><h3 class="constellation-selected-name">Un universo de herramientas</h3><p class="constellation-selected-description">Selecciona cualquier tecnología para descubrir su función dentro de la constelación.</p></div>
        </div>
      </div>
    </Section>
  ) as HTMLElement;
  const viewport = section.querySelector<HTMLElement>('.constellation-viewport')!;
  const canvas = section.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('.constellation-node'));
  const zoomLabel = section.querySelector<HTMLElement>('.constellation-zoom')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let yaw = .08, pitch = -.08, zoom = 1;
  let targetYaw = yaw, targetPitch = pitch, targetZoom = zoom;
  let width = 1, height = 1, selected = -1, frame = 0;
  let visible = false;
  let drag: { id: number; x: number; y: number; distance: number } | undefined;
  let suppressClick = false;
  const stars = Array.from({ length: 260 }, (_, i) => ({ x: ((i * 7919) % 1000) / 1000, y: ((i * 3571) % 997) / 997, radius: i % 5 === 0 ? 1.3 : .65 }));

  function project(point: Point) {
    const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
    const z = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
    const y = point.y * Math.cos(pitch) - z * Math.sin(pitch);
    const depth = point.y * Math.sin(pitch) + z * Math.cos(pitch);
    const perspective = 850 / (850 + depth);
    const scale = (width / 900) * zoom * perspective;
    const verticalScale = (height / 650) * zoom * perspective;
    return { x: width / 2 + x * scale, y: height / 2 + y * verticalScale, scale: perspective, depth };
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const time = reduced.matches ? 0 : performance.now() * .00016;
    stars.forEach((star, i) => {
      const phase = i * 1.618;
      const dx = reduced.matches ? 0 : Math.sin(time + phase) * 12;
      const dy = reduced.matches ? 0 : Math.cos(time * .7 + phase) * 8;
      ctx.globalAlpha = .4 + (Math.sin(time * 1.2 + phase) + 1) * .2;
      ctx.fillStyle = i % 4 === 0 ? '#c4b5fd' : '#eee5ff';
      ctx.beginPath(); ctx.arc(star.x * width + dx, star.y * height + dy, star.radius, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    const points = nodes.map((node) => project(node.point));
    // Connections within each cluster and bridges between the four categories.
    nodes.forEach((node, i) => nodes.forEach((other, j) => {
      if (j <= i) return;
      const same = node.group === other.group;
      const bridge = i === nodes.findIndex((n) => n.group === node.group) && j === nodes.findIndex((n) => n.group === other.group);
      if (!same && !bridge) return;
      const highlighted = i === selected || j === selected;
      ctx.strokeStyle = highlighted ? '#ead5ffcc' : same ? '#c4b5fd55' : '#c4b5fd28';
      ctx.lineWidth = highlighted ? 1.5 : .7;
      ctx.shadowColor = '#c4b5fd'; ctx.shadowBlur = highlighted ? 10 : 2;
      ctx.beginPath(); ctx.moveTo(points[i].x, points[i].y); ctx.lineTo(points[j].x, points[j].y); ctx.stroke();
    }));
    ctx.shadowBlur = 0;
    centers.forEach((center, i) => {
      const p = project(center);
      ctx.font = `${Math.max(10, Math.min(13, width / 65))}px system-ui`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#d9c8ffb3';
      ctx.fillText(data.groups[i].title.toLocaleUpperCase('es'), p.x, p.y);
    });
    buttons.forEach((button, i) => {
      const p = points[i];
      const scale = Math.max(.65, Math.min(1.22, p.scale)) * (width < 540 ? .78 : 1);
      button.style.left = `${p.x}px`; button.style.top = `${p.y}px`;
      button.style.transform = `translate(-50%, -50%) scale(${scale})`;
      button.style.zIndex = String(Math.round(500 - p.depth));
      button.style.opacity = String(Math.max(.5, Math.min(1, p.scale)));
    });
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }
  function tick() {
    frame = 0;
    const ease = reduced.matches ? 1 : .14;
    yaw += (targetYaw - yaw) * ease;
    pitch += (targetPitch - pitch) * ease;
    zoom += (targetZoom - zoom) * ease;
    draw();
    if (visible && !document.hidden && (!reduced.matches || Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) + Math.abs(targetZoom - zoom) > .0005)) requestDraw();
  }
  function requestDraw() { if (!frame) frame = requestAnimationFrame(tick); }
  function setZoom(value: number) { targetZoom = Math.max(.55, Math.min(2.2, value)); requestDraw(); }
  function select(index: number) {
    selected = index;
    const tech = nodes[index];
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const logo = section.querySelector<HTMLImageElement>('.constellation-selected-logo img')!;
    logo.src = `/logos/${logos[tech.name]}.svg`; logo.alt = `Logo de ${tech.name}`;
    section.querySelector<HTMLElement>('.constellation-selected-logo')!.hidden = false;
    section.querySelector<HTMLElement>('.constellation-selected-category')!.textContent = data.groups[tech.group].title;
    section.querySelector<HTMLElement>('.constellation-selected-name')!.textContent = tech.name;
    section.querySelector<HTMLElement>('.constellation-selected-description')!.textContent = descriptions[tech.name];
    requestDraw();
  }
  buttons.forEach((button, i) => button.addEventListener('click', (event) => { if (!suppressClick || event.detail === 0) select(i); }));
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || drag) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    suppressClick = false;
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    drag.distance += Math.abs(dx) + Math.abs(dy);
    if (drag.distance > 6) {
      suppressClick = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
      targetYaw += dx * .006;
      targetPitch = Math.max(-1.1, Math.min(1.1, targetPitch + dy * .006));
      requestDraw();
    }
    drag.x = event.clientX; drag.y = event.clientY;
  });
  function endDrag(event: PointerEvent) {
    if (drag?.id !== event.pointerId) return;
    drag = undefined; viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', () => { drag = undefined; viewport.classList.remove('is-dragging'); });
  viewport.addEventListener('wheel', (event) => { event.preventDefault(); setZoom(targetZoom * Math.exp(-event.deltaY * .001)); }, { passive: false });
  viewport.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'ArrowLeft') targetYaw -= .18;
      if (event.key === 'ArrowRight') targetYaw += .18;
      if (event.key === 'ArrowUp') targetPitch = Math.max(-1.1, targetPitch - .15);
      if (event.key === 'ArrowDown') targetPitch = Math.min(1.1, targetPitch + .15);
      if (event.key === '+' || event.key === '=') setZoom(targetZoom + .15);
      if (event.key === '-') setZoom(targetZoom - .15);
      requestDraw();
    }
  });
  section.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.camera === 'in') setZoom(targetZoom + .2);
    else if (button.dataset.camera === 'out') setZoom(targetZoom - .2);
    else { targetYaw = .08; targetPitch = -.08; targetZoom = 1; requestDraw(); }
  }));
  new ResizeObserver(() => {
    width = viewport.clientWidth; height = viewport.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); requestDraw();
  }).observe(viewport);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
  }).observe(viewport);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) requestDraw(); });
  reduced.addEventListener('change', requestDraw);
  return section;
}
