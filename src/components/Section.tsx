import { h, type Child } from '../jsx';

interface SectionProps {
  id: string;
  class?: string;
  children?: Child;
}

/** Envoltorio común de cada sección: ancla para la navegación y ancho máximo. */
export function Section({ id, class: className = '', children }: SectionProps): Node {
  return (
    <section id={id} class={`section ${className}`}>
      <div class="container">{children}</div>
    </section>
  );
}
