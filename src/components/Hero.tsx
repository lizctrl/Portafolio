
import { h } from '../jsx';
import type { content, SocialLink } from '../content';
import { CodeCard } from './CodeCard';
import { HeroBackground } from './HeroBackground';
import { Icon } from './Icon';
import { SocialLinks } from './SocialLinks';

interface HeroProps {
  data: typeof content.hero;
  social: SocialLink[];
}

export function Hero({ data, social }: HeroProps): Node {
  return (
    <section id="inicio" class="hero">
      <HeroBackground />

      <div class="container hero-grid">
        <div class="hero-text">
          <p class="status">
            <span class="status-dot" aria-hidden="true" />
            {data.badge}
          </p>

          <h1>
            {data.greeting}{' '}
            <span class="accent">{data.name}.</span>
          </h1>

          <p class="hero-role">{data.role}</p>
          <p class="hero-intro">{data.intro}</p>

          <div class="hero-actions">
            <a
              class="btn btn-primary"
              href={data.primaryCta.href}
            >
              <Icon name="rocket" size={18} />
              {data.primaryCta.label}
              <Icon name="arrowUpRight" size={16} />
            </a>

            <a
              class="btn btn-outline"
              href={data.secondaryCta.href}
            >
              {data.secondaryCta.label}
            </a>
          </div>

          <SocialLinks links={social} />
        </div>

        <div class="hero-visual">
          <CodeCard {...data.code} />

          <div class="hero-photo-wrapper">
            <img
              class="hero-photo"
              src={data.photo.src}
              alt={data.photo.alt}
              width="640"
              height="560"
              fetchpriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
