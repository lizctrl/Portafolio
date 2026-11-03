import { defineConfig, type Plugin } from 'vite';
import { content } from './src/content';

// Metadatos SEO generados desde src/content.ts, para que Liz edite un solo archivo.
function seo(): Plugin {
  const { seo, hero, social } = content;
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const site = (prod ? `https://${prod}` : seo.siteUrl).replace(/\/$/, '') + '/';
  const image = new URL(seo.image, site).href;
  const escape = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const meta = (attrs: Record<string, string>) => ({ tag: 'meta', attrs, injectTo: 'head' as const });

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: hero.name,
    jobTitle: hero.role,
    description: seo.description,
    url: site,
    image,
    sameAs: social.filter((s) => s.icon === 'github' || s.icon === 'linkedin').map((s) => s.href),
  };

  return {
    name: 'seo',
    transformIndexHtml: () => [
      { tag: 'title', children: escape(seo.title), injectTo: 'head' },
      meta({ name: 'description', content: seo.description }),
      { tag: 'link', attrs: { rel: 'canonical', href: site }, injectTo: 'head' },
      meta({ property: 'og:type', content: 'website' }),
      meta({ property: 'og:locale', content: seo.locale }),
      meta({ property: 'og:url', content: site }),
      meta({ property: 'og:title', content: seo.title }),
      meta({ property: 'og:description', content: seo.description }),
      meta({ property: 'og:image', content: image }),
      meta({ property: 'og:image:width', content: '1200' }),
      meta({ property: 'og:image:height', content: '630' }),
      meta({ name: 'twitter:card', content: 'summary_large_image' }),
      {
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        injectTo: 'head',
        children: JSON.stringify(person).replace(/</g, '\\u003c'),
      },
      // Respaldo para quien no ejecuta JavaScript.
      {
        tag: 'noscript',
        injectTo: 'body-prepend',
        children: `<h1>${escape(`${hero.greeting} ${hero.name}. ${hero.role}`)}</h1><p>${escape(seo.description)}</p>`,
      },
    ],
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}sitemap.xml\n` });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}</loc></url>\n</urlset>\n`,
      });
    },
  };
}

// JSX sin React: cada etiqueta se convierte en una llamada a nuestra fábrica `h` (src/jsx.ts).
export default defineConfig({
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  plugins: [seo()],
});
