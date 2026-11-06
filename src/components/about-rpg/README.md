# LIZ'S WORLD — RPG Adventure

RPG cenital integrado exclusivamente en `About` mediante `AboutMeRPG`. Conserva `#sobre-mi` y enlaza al ancla real `#proyectos`. No requiere nuevas dependencias ni rutas. La versión de plataformas anterior se conserva en `about-game/`, sin utilizarse en la nueva sección.

## Arquitectura

- `model.ts`: tipos, estado y objetivos.
- `map.ts`: tres escenas, objetos, sólidos y puntos de interacción.
- `physics.ts`: movimiento normalizado, colisión por ejes con subpasos, cambios de escena y misión.
- `art.ts`: atlas de pixel art original creado mediante Canvas, con caché de tiles y sprites.
- `renderer.ts`: mapa, orden de profundidad, avatar de cuatro direcciones, ambiente y efectos.
- `engine.ts`: RAF con delta time limitado, cámara, resize, pausa fuera de pantalla y diagnóstico DOM de escena/posición.
- `controls.ts`: teclado local, D-pad con pulsación sostenida y liberación de punteros.
- `dialogue.ts`: diálogos HTML, escritura opcional, revelado inmediato, páginas, Escape y foco.
- `AboutMeRPG.tsx`: contenido real del portafolio, interacciones, HUD, lectura alternativa y ciclo de vida.
- `rpg.css`: únicamente `.liz-rpg` y la integración `.about-rpg-section`.

## Arte y contenido

Todo el pixel art se dibuja con código original: tiles de 24 px, árboles, flores, casas, laboratorio, muebles, NPC, avatar y portal. No se utilizan sprites, mapas, personajes, música, nombres ni recursos gráficos de Pokémon. Las referencias del usuario orientan únicamente la composición y el género de exploración. No se descargan gráficos externos y no se requiere atribución de terceros.

La biografía, intereses, motivaciones, fotografía y nombres de tecnologías se leen de `content.about` y `content.skills`. Las tarjetas explican la función de las tecnologías sin añadir experiencia profesional. La alternativa «Ver información sin jugar» muestra todo el contenido en HTML.

El portal está disponible desde el principio. La misión puede completarse en cualquier orden; el jardín requiere cuatro cristales distintos. No hay saltos ni plataformas, vidas, combate, música automática ni requisitos para acceder a proyectos.

## Validación

```sh
node --test tests/about-rpg.test.cjs tests/about-game.test.cjs
npm run build
```

Las pruebas compilan los módulos reales de física con el TypeScript existente en una carpeta temporal. Incluyen conectividad por búsqueda de caminos para todos los puntos interactivos de las tres escenas, colisiones, movimiento diagonal, interiores y progreso. El proyecto no tiene un script de lint.

## Comprobaciones ejecutadas

- Build de producción y comprobación de tipos con `npm run build`.
- 25 pruebas: 14 del nuevo RPG y 11 conservadas del motor anterior.
- Recorrido en navegador con teclado por casa, cuatro terminales, portal y cuatro cristales; misión completada 4/4 en orden no rígido.
- Escritura progresiva, revelado inmediato, avance de páginas, cierre con Escape y restauración de foco.
- Portal disponible antes de completar la misión, enlazando a `#proyectos`.
- Vistas de escritorio de 1440 px y móviles emulados de 390 y 320 px sin desbordamiento horizontal.
- Controles direccionales con pulsación sostenida, liberación y cancelación; salida del modo de juego sin capturar teclas del documento.
- Lectura alternativa con biografía, fotografía, siete intereses/motivaciones y los cuatro grupos del stack.
- Movimiento reducido sin ambiente animado ni escritura gradual; pausa fuera de pantalla y reanudación al volver.
- Comparación de hashes de los archivos de código existentes fuera de `About`: ningún cambio.

No se ha medido FPS en dispositivos físicos; la validación móvil se realizó mediante emulación de navegador. No se ejecutó lint porque el repositorio no tiene ese script.
