import { h } from '../jsx';
import type { Trait } from '../content';
import { Icon } from './Icon';

export function TraitItem({ icon, label }: Trait): Node {
  return (
    <li class="trait">
      <Icon name={icon} size={30} />
      <span>{label}</span>
    </li>
  );
}
