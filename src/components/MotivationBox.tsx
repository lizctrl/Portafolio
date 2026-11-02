import { h } from '../jsx';
import { Icon } from './Icon';

interface MotivationBoxProps {
  title: string;
  items: string[];
}

export function MotivationBox({ title, items }: MotivationBoxProps): Node {
  return (
    <aside class="card motivation" aria-labelledby="motivation-title">
      <h3 id="motivation-title"><Icon name="sparkles" size={22} />{title}</h3>
      <ul>
        {items.map((item) => (
          <li><Icon name="check" size={18} />{item}</li>
        ))}
      </ul>
    </aside>
  );
}
