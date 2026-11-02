import { h } from '../jsx';
import type { TechGroup } from '../content';
import { Icon } from './Icon';

export function TechCard({ title, icon, items }: TechGroup): Node {
  return (
    <article class="card tech-card">
      <h3><Icon name={icon} size={22} />{title}</h3>
      <ul class="chips">
        {items.map((tech) => (
          <li class="chip"><span class="chip-dot" style={`background:${tech.color}`} aria-hidden="true" />{tech.name}</li>
        ))}
      </ul>
    </article>
  );
}
