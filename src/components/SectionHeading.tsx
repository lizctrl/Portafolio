import { h } from '../jsx';

interface SectionHeadingProps {
  badge: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ badge, title, subtitle }: SectionHeadingProps): Node {
  return (
    <div class="section-heading">
      <span class="badge">{badge}</span>
      <h2>{title}</h2>
      {subtitle && <p class="lead">{subtitle}</p>}
    </div>
  );
}
