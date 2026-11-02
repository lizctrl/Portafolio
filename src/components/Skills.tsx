import { h } from '../jsx';
import type { content } from '../content';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { TechCard } from './TechCard';

interface SkillsProps {
  data: typeof content.skills;
}

export function Skills({ data }: SkillsProps): Node {
  return (
    <Section id="habilidades" class="skills">
      <SectionHeading badge={data.badge} title={data.title} subtitle={data.subtitle} />
      <div class="tech-grid">
        {data.groups.map((group) => <TechCard {...group} />)}
      </div>
    </Section>
  );
}
