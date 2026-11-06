import { h } from '../jsx';
import type { TechGroup } from '../content';
import { Icon } from './Icon';

const logos: Record<string, string> = {
  React: 'react', 'Next.js': 'nextjs', 'Tailwind CSS': 'tailwindcss',
  TypeScript: 'typescript', 'Node.js': 'nodejs', Java: 'java', Python: 'python',
  PostgreSQL: 'postgresql', MongoDB: 'mongodb', Firebase: 'firebase',
  Git: 'git', GitHub: 'github', Docker: 'docker', Figma: 'figma',
};

const descriptions: Record<string, string> = {
  React: 'Biblioteca para crear interfaces interactivas a partir de componentes reutilizables.',
  'Next.js': 'Framework basado en React para desarrollar aplicaciones web con rutas y renderizado en el servidor.',
  'Tailwind CSS': 'Herramientas de CSS para construir interfaces adaptables con clases de utilidad.',
  TypeScript: 'JavaScript con tipos estáticos para detectar errores y mantener el código más claro.',
  'Node.js': 'Entorno para ejecutar JavaScript en el servidor y construir servicios y APIs.',
  Java: 'Lenguaje orientado a objetos para desarrollar aplicaciones y servicios de backend.',
  Python: 'Lenguaje versátil para automatización, procesamiento de datos y desarrollo de aplicaciones.',
  PostgreSQL: 'Base de datos relacional para organizar información y realizar consultas con SQL.',
  MongoDB: 'Base de datos documental que almacena información en estructuras flexibles.',
  Firebase: 'Plataforma con servicios de autenticación, bases de datos y alojamiento para aplicaciones.',
  Git: 'Sistema de control de versiones para registrar cambios y colaborar en el código.',
  GitHub: 'Plataforma para alojar repositorios, revisar cambios y colaborar en proyectos con Git.',
  Docker: 'Herramienta para empaquetar aplicaciones y sus dependencias en contenedores.',
  Figma: 'Herramienta de diseño colaborativo para crear interfaces y prototipos interactivos.',
};

export function TechCard({ title, icon, items }: TechGroup): Node {
  const card = (
    <article class="card tech-card">
      <div class="tech-overview">
        <h3><Icon name={icon} size={22} />{title}</h3>
        <ul class="chips">
          {items.map((tech) => (
            <li><button type="button" class="chip tech-select" data-tech={tech.name}
              aria-label={`Ver logo de ${tech.name}`}>
              <span class="chip-dot" style={`background:${tech.color}`} aria-hidden="true" />{tech.name}
            </button></li>
          ))}
        </ul>
      </div>
      <div class="tech-detail" hidden>
        <button type="button" class="tech-back" aria-label={`Volver a ${title}`}>← {title}</button>
        <div class="tech-detail-layout">
          <div class="tech-logo-pedestal"><img class="tech-logo" width="160" height="160" alt="" /></div>
          <div class="tech-copy" aria-live="polite">
            <span class="tech-category">{title}</span>
            <p class="tech-name" />
            <p class="tech-description" />
          </div>
        </div>
      </div>
    </article>
  ) as HTMLElement;
  const overview = card.querySelector<HTMLElement>('.tech-overview')!;
  const detail = card.querySelector<HTMLElement>('.tech-detail')!;
  const image = card.querySelector<HTMLImageElement>('.tech-logo')!;
  const name = card.querySelector<HTMLElement>('.tech-name')!;
  const description = card.querySelector<HTMLElement>('.tech-description')!;
  const back = card.querySelector<HTMLButtonElement>('.tech-back')!;
  let selected: HTMLButtonElement | undefined;

  card.querySelectorAll<HTMLButtonElement>('[data-tech]').forEach((button) => {
    button.addEventListener('click', () => {
      const tech = button.dataset.tech!;
      selected = button;
      image.src = `/logos/${logos[tech]}.svg`;
      image.alt = `Logo de ${tech}`;
      name.textContent = tech;
      description.textContent = descriptions[tech];
      card.classList.add('has-tech-detail');
      overview.hidden = true;
      detail.hidden = false;
      card.dispatchEvent(new CustomEvent('techselect', { bubbles: true }));
      back.focus({ preventScroll: true });
    });
  });
  function close(restoreFocus = true) {
    card.classList.remove('has-tech-detail');
    detail.hidden = true;
    overview.hidden = false;
    if (restoreFocus) selected?.focus({ preventScroll: true });
  }
  back.addEventListener('click', () => close());
  card.addEventListener('techreset', () => close(false));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !detail.hidden) close();
  });
  return card;
}
