import { h } from '../jsx';
import type { content } from '../content';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { TechCard } from './TechCard';

interface SkillsProps {
  data: typeof content.skills;
}

export function Skills({ data }: SkillsProps): Node {
  const section = (
    <Section id="habilidades" class="skills">
      <SectionHeading badge={data.badge} title={data.title} subtitle={data.subtitle} />
      <div class="skills-carousel" role="region" aria-roledescription="carrusel" aria-label="Categorías de habilidades">
        <div class="tech-grid" title="Mueve el mouse de lado a lado para rotar">
          {data.groups.map((group) => <TechCard {...group} />)}
        </div>
        <div class="skills-controls">
          <button type="button" data-step="-1" aria-label="Categoría anterior">←</button>
          <span class="skills-current" aria-live="off" />
          <button type="button" data-step="1" aria-label="Categoría siguiente">→</button>
        </div>
      </div>
    </Section>
  ) as HTMLElement;

  const carousel = section.querySelector<HTMLElement>('.skills-carousel')!;
  const cards = Array.from(section.querySelectorAll<HTMLElement>('.tech-card'));
  const current = section.querySelector<HTMLElement>('.skills-current')!;
  const stage = section.querySelector<HTMLElement>('.tech-grid')!;
  let active = 0;
  let previousX: number | undefined;
  let travel = 0;

  function render() {
    cards.forEach((card, index) => {
      const offset = (index - active + cards.length) % cards.length;
      card.dataset.position = String(offset);
      card.setAttribute('aria-label', `${index + 1} de ${cards.length}: ${data.groups[index].title}`);
    });
    current.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')} · ${data.groups[active].title}`;
  }

  function move(step: number) {
    cards.forEach((card) => card.dispatchEvent(new Event('techreset')));
    active = (active + step + cards.length) % cards.length;
    render();
  }

  stage.addEventListener('techselect', (event) => {
    const card = (event.target as HTMLElement).closest('.tech-card');
    const index = cards.findIndex((item) => item === card);
    if (index >= 0) {
      cards.filter((item) => item !== card).forEach((item) => item.dispatchEvent(new Event('techreset')));
      active = index;
      travel = 0;
      render();
    }
  });

  carousel.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button) => {
    button.addEventListener('click', () => move(Number(button.dataset.step)));
  });
  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  // Only deliberate pointer movement rotates the cards; no timers or autoplay.
  stage.addEventListener('pointerenter', (event) => {
    previousX = event.clientX;
    travel = 0;
  });
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || previousX === undefined) return;
    if ((event.target as HTMLElement).closest('button, .tech-detail')) {
      previousX = event.clientX;
      travel = 0;
      return;
    }
    const delta = event.clientX - previousX;
    previousX = event.clientX;
    if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    const threshold = Math.max(45, stage.clientWidth / 5);
    if (Math.abs(travel) < threshold) return;
    move(travel > 0 ? 1 : -1);
    travel = 0;
  });
  stage.addEventListener('pointerleave', () => {
    previousX = undefined;
    travel = 0;
  });
  render();
  return section;
}
