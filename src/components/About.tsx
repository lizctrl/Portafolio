import { h } from '../jsx';
import type { content } from '../content';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { AboutMeGame } from './about-game/AboutMeGame';

interface AboutProps { data: typeof content.about }

export function About({ data }: AboutProps): Node {
  return (
    <Section id="sobre-mi" class="about about-game-section">
      <SectionHeading badge={data.badge} title={data.title} subtitle="Explora mi mundo y descubre lo que me apasiona." />
      <AboutMeGame data={data} projectsHref="#proyectos" />
    </Section>
  );
}
