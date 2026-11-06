# LIZ'S WORLD

Componente DOM/Canvas encapsulado dentro de `About`. No añade dependencias ni rutas.

- `AboutMeGame.tsx`: HUD, paneles nativos `dialog`, progreso, alternativa HTML y ciclo de vida.
- `model.ts`: tipos y posiciones del escenario. Los textos profesionales proceden de `content.about`.
- `physics.ts`: aceleración, fricción, salto, gravedad, plataformas de un sentido y descubrimientos.
- `controls.ts`: teclado con foco local, botones táctiles sostenidos y cancelación de entradas.
- `engine.ts`: timestep fijo de 120 Hz, render mediante RAF, cámara amortiguada y pausa fuera de pantalla.
- `renderer.ts`: avatar vectorial con seis estados, estaciones, partículas limitadas y parallax.
- `game.css`: estilos limitados a `.liz-world` y a la integración `.about-game-section`.

La altura del mundo es constante: el móvil usa una cámara, no una miniatura del escenario de escritorio. El portal requiere descubrir las otras tres estaciones. No existen saltos obligatorios ni penalizaciones.

El juego captura teclas solo con foco en el escenario. Al cerrar un panel se restaura el foco. La lectura alternativa conserva biografía, fotografía, intereses y motivaciones sin requerir jugar. El progreso es local a la visita y el reinicio lo vacía. El componente libera eventos y observadores al retirarse del DOM o recargarse mediante HMR.

Validación desde la raíz del proyecto:

```sh
node --test tests/about-game.test.cjs
npm run build
```

El test usa el compilador TypeScript ya instalado y una carpeta temporal, sin incorporar un framework de pruebas. No existen scripts de lint ni test globales en el proyecto.
