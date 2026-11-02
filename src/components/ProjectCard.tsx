import { h } from '../jsx';
import type { Project } from '../content';
import { Icon } from './Icon';
import { Tag } from './Tag';

export function ProjectCard({ title, description, image, tags, url }: Project): Node {
  return (
    <article class="card project-card">
      <img src={image.src} alt={image.alt} width="640" height="400" loading="lazy" />
      <div class="project-body">
        <h3>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}<Icon name="external" size={18} />
            <span class="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </h3>
        <p>{description}</p>
        <ul class="tags" aria-label="Tecnologías">
          {tags.map((tag) => <Tag>{tag}</Tag>)}
        </ul>
      </div>
    </article>
  );
}
