import { h } from '../jsx';
import type { SocialLink } from '../content';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

interface FooterProps {
  brand: string;
  owner: string;
  madeBy: string;
  social: SocialLink[];
}

export function Footer({ brand, owner, madeBy, social }: FooterProps): Node {
  return (
    <footer class="footer">
      <div class="container footer-inner">
        <Logo brand={brand} />
        <p>
          © {new Date().getFullYear()} {owner}. Desarrollado con <Icon name="heart" size={14} />
          <span class="sr-only">amor</span> por {madeBy}.
        </p>
        <SocialLinks links={social} />
      </div>
    </footer>
  );
}
