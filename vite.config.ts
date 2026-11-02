import { defineConfig } from 'vite';

// JSX sin React: cada etiqueta se convierte en una llamada a nuestra fábrica `h` (src/jsx.ts).
export default defineConfig({
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
});
