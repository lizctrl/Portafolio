import { h } from '../jsx';
import type { content } from '../content';
import { Icon } from './Icon';
import { Section } from './Section';

interface CallToActionProps {
  data: typeof content.contact;
}

export function CallToAction({ data }: CallToActionProps): Node {
  return (
    <Section id="contacto" class="cta-section">
      <div class="cta">
        <span class="cta-icon" aria-hidden="true"><Icon name="send" size={34} /></span>
        <div class="cta-text">
          <h2>{data.title}</h2>
          <p>{data.text}</p>
        </div>
        <a class="btn btn-primary" href={data.button.href}><Icon name="mail" size={20} />{data.button.label}</a>
      </div>
    </Section>
  );
}
