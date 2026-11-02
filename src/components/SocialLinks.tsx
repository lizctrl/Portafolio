import { h } from '../jsx';
import type { SocialLink } from '../content';
import { Icon } from './Icon';

interface SocialLinksProps {
  links: SocialLink[];
}

export function SocialLinks({ links }: SocialLinksProps): Node {
  return (
    <ul class="social">
      {links.map((link) => {
        const external = link.href.startsWith('http');
        return (
          <li>
            <a href={link.href} aria-label={link.label} title={link.label}
              target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
              <Icon name={link.icon} size={22} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
