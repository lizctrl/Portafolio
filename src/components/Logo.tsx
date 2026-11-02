import { h } from '../jsx';

interface LogoProps {
  brand: string;
}

export function Logo({ brand }: LogoProps): Node {
  return (
    <a class="logo" href="#inicio" aria-label={`${brand}, ir al inicio`}>
      <span class="logo-mark" aria-hidden="true">&lt;/&gt;</span>
      <span>{brand}<span class="logo-dot">.</span></span>
    </a>
  );
}
