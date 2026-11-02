import { h } from '../jsx';
import type { Link } from '../content';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  brand: string;
  links: Link[];
}

export function Navbar({ brand, links }: NavbarProps): Node {
  return (
    <header class="navbar">
      <nav class="container navbar-inner" aria-label="Principal">
        <Logo brand={brand} />
        <ul class="nav-links">
          {links.map((link) => (
            <li><a href={link.href}>{link.label}</a></li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
