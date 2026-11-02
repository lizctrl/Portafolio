import { h } from '../jsx';
import type { content } from '../content';
import { MotivationBox } from './MotivationBox';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { TraitItem } from './TraitItem';

interface AboutProps {
  data: typeof content.about;
}

export function About({ data }: AboutProps): Node {
  return (
    <Section id="sobre-mi" class="about">
      <div class="about-photo">
        <img src={data.photo.src} alt={data.photo.alt} width="480" height="520" loading="lazy" />
        <span class="about-chip" aria-hidden="true">&lt;/&gt;</span>
      </div>
      <div class="about-text">
        <SectionHeading badge={data.badge} title={data.title} />
        <p>{data.text}</p>
        <ul class="traits">
          {data.traits.map((trait) => <TraitItem {...trait} />)}
        </ul>
      </div>
      <MotivationBox {...data.motivation} />
    </Section>
  );
}
