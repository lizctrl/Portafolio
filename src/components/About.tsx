import { h } from '../jsx';
import { content } from '../content';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { AboutMeRPG } from './about-rpg/AboutMeRPG';

interface AboutProps { data: typeof content.about }
export function About({ data }: AboutProps): Node {
  return (
    <Section id="sobre-mi" class="about about-rpg-section">
      <SectionHeading badge={data.badge} title={data.title} subtitle="Explora mi mundo y descubre mi historia. A tu ritmo." />
      <AboutMeRPG about={data} skills={content.skills} projectsHref="#proyectos" />
    </Section>
  );
}
