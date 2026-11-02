import { h, type Child } from '../jsx';

interface TagProps {
  children?: Child;
}

export function Tag({ children }: TagProps): Node {
  return <li class="tag">{children}</li>;
}
