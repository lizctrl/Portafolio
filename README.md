# Portafolio de Liz

Página personal hecha con **Vite + TypeScript + TSX, sin framework**. El JSX se convierte en DOM real con una fábrica propia (`src/jsx.ts`), así que no hay React: solo Vite y TypeScript.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera la carpeta dist/
```

## Editar el contenido

Todo lo que se lee en la página está en **`src/content.ts`**: textos, enlaces del menú, redes sociales, tecnologías, proyectos y el bloque de contacto. Cambia ahí los valores y guarda; no hace falta tocar los componentes.

- **Correo y LinkedIn:** ahora son de ejemplo (`correo@ejemplo.com`). Cámbialos en `social` y en `contact.button`.
- **Añadir un proyecto:** copia uno de `projects.items` y edita título, descripción, imagen, etiquetas y `url`.
- **Tecnologías:** cada una tiene un `name` y un `color` para el punto.

### Fotos y capturas

Están en `public/` como marcadores. Para poner las reales, copia tu imagen en `public/` y cambia su ruta en `content.ts`:

| Marcador | Dónde sale | Tamaño recomendado |
| --- | --- | --- |
| `liz-hero.svg` | Portada | 1280 × 1120 (horizontal o casi cuadrada) |
| `liz-about.svg` | Sobre mí | 960 × 1040 (vertical) |
| `taskflow.svg`, `moviehub.svg`, `tienda.svg` | Proyectos | 1280 × 800 (16:10) |

Por ejemplo: guarda `public/liz-hero.jpg` y pon `photo: { src: '/liz-hero.jpg', alt: '…' }`. Escribe siempre un `alt` que describa la imagen.

### SEO y redes sociales

En `seo` (dentro de `content.ts`) están el título, la descripción y la imagen que muestran Google, WhatsApp, LinkedIn, etc. Al compilar se generan automáticamente las etiquetas `meta`, Open Graph, los datos estructurados (`Person`), `robots.txt` y `sitemap.xml`.

- En Vercel la URL de producción se detecta sola. Si usas un dominio propio, ponlo en `seo.siteUrl`.
- `public/og-image.png` (1200 × 630) es la imagen al compartir el enlace. Puedes sustituirla por otra del mismo tamaño.

## Estructura

```
src/
  main.ts          monta <App /> en #app
  App.tsx          compone la página
  content.ts       ✏️ el contenido editable
  jsx.ts           fábrica h() y Fragment
  styles.css       estilos, modo claro y oscuro
  components/      un componente por archivo (Navbar, Hero, ProjectCard…)
```

## Desplegar en Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** e importa el repositorio `lizctrl/Portafolio`.
2. Vercel detecta **Vite**: comando `npm run build`, carpeta de salida `dist`. No hay que cambiar nada.
3. Pulsa **Deploy**. Cada push a `main` vuelve a publicar la página.
