import { h } from '../jsx';
import type { content } from '../content';
import { Icon } from './Icon';
import { ProjectCard } from './ProjectCard';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';

interface ProjectsProps {
  data: typeof content.projects;
}

export function Projects({ data }: ProjectsProps): Node {
  return (
    <Section id="proyectos" class="projects">
      <div class="projects-head">
        <SectionHeading badge={data.badge} title={data.title} subtitle={data.subtitle} />
        <a class="link-arrow" href={data.allLink.href} target="_blank" rel="noopener noreferrer">
          {data.allLink.label}<Icon name="arrowUpRight" size={16} />
        </a>
      </div>
      <div class="project-grid">
        {data.items.map((project) => <ProjectCard {...project} />)}
      </div>
    </Section>
  );
}
