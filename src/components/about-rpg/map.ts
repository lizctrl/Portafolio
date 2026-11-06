import { TILE, type SceneMap, type SceneId, type Rect } from './model';

export function isPath(x: number, y: number): boolean {
  return (y >= 360 && y < 408 && x >= 216 && x < 840)
    || (x >= 240 && x < 288 && y >= 240 && y < 624)
    || (x >= 768 && x < 816 && y >= 240 && y < 600)
    || (y >= 240 && y < 288 && x >= 240 && x < 816)
    || (x >= 432 && x < 624 && y >= 312 && y < 432)
    || (x >= 168 && x < 360 && y >= 528 && y < 576)
    || (x >= 744 && x < 864 && y >= 528 && y < 600);
}
export function isWater(x: number, y: number): boolean { return x >= 432 && x < 624 && y >= 96 && y < 216; }
const village: SceneMap = {
  id: 'village', title: 'Plaza de bienvenida', width: 1056, height: 720, spawn: { x: 528, y: 384 },
  solids: [
    { x: 0, y: 0, width: 1056, height: 60 }, { x: 0, y: 672, width: 1056, height: 48 },
    { x: 0, y: 0, width: 60, height: 720 }, { x: 996, y: 0, width: 60, height: 720 },
    { x: 432, y: 96, width: 192, height: 120 },
    { x: 176, y: 150, width: 152, height: 90 }, { x: 704, y: 150, width: 176, height: 90 },
    { x: 504, y: 314, width: 48, height: 22 }, { x: 770, y: 510, width: 44, height: 40 },
  ],
  objects: [
    { kind: 'house', x: 252, y: 240 }, { kind: 'lab', x: 792, y: 240 },
    { kind: 'fountain', x: 528, y: 336 }, { kind: 'npc', x: 566, y: 370, variant: 0 },
    { kind: 'sign', x: 450, y: 374, label: "LIZ'S WORLD" },
    { kind: 'portal', x: 792, y: 550 },
    { kind: 'npc', x: 264, y: 552, variant: 1 },
    { kind: 'crystal', x: 204, y: 504, variant: 0 }, { kind: 'crystal', x: 324, y: 504, variant: 1 },
    { kind: 'crystal', x: 204, y: 600, variant: 2 }, { kind: 'crystal', x: 324, y: 600, variant: 3 },
    { kind: 'sign', x: 168, y: 468, label: 'JARDÍN' }, { kind: 'sign', x: 864, y: 586, label: 'PROYECTOS' },
    { kind: 'bench', x: 384, y: 438 }, { kind: 'bench', x: 648, y: 438 },
    { kind: 'lamp', x: 216, y: 286 }, { kind: 'lamp', x: 840, y: 286 },
    { kind: 'lamp', x: 408, y: 360 }, { kind: 'lamp', x: 648, y: 360 },
    { kind: 'blossom', x: 120, y: 240 }, { kind: 'blossom', x: 372, y: 216 },
    { kind: 'blossom', x: 936, y: 252 }, { kind: 'blossom', x: 660, y: 192 },
    { kind: 'blossom', x: 120, y: 528 }, { kind: 'blossom', x: 408, y: 600 },
    { kind: 'blossom', x: 696, y: 552 }, { kind: 'blossom', x: 912, y: 528 },
    { kind: 'tree', x: 384, y: 312 }, { kind: 'tree', x: 660, y: 312 },
    { kind: 'tree', x: 144, y: 360 }, { kind: 'tree', x: 936, y: 384 },
    { kind: 'tree', x: 432, y: 504 }, { kind: 'tree', x: 600, y: 552 },
    { kind: 'tree', x: 504, y: 624 }, { kind: 'tree', x: 936, y: 624 },
    { kind: 'rock', x: 96, y: 432 }, { kind: 'rock', x: 648, y: 624 },
  ],
  interactions: [
    { id: 'welcome', kind: 'welcome', x: 566, y: 382, label: 'Hablar con Liz' },
    { id: 'welcome-sign', kind: 'sign', x: 450, y: 386, label: 'Leer la bienvenida' },
    { id: 'home-door', kind: 'enter-home', x: 252, y: 254, label: 'Entrar a la casa de Liz' },
    { id: 'lab-door', kind: 'enter-lab', x: 792, y: 254, label: 'Entrar al laboratorio' },
    { id: 'gardener', kind: 'gardener', x: 264, y: 564, label: 'Hablar con la jardinera' },
    ...[0, 1, 2, 3].map((index) => ({ id: `motivation-${index}`, kind: 'motivation' as const, index, x: index % 2 ? 324 : 204, y: index < 2 ? 516 : 612, label: `Descubrir motivación ${index + 1}` })),
    { id: 'portal', kind: 'portal', x: 792, y: 572, label: 'Explorar el portal de proyectos' },
  ],
};

// Forest borders and flower beds are deterministic, original map decorations.
for (let x = 36; x <= 1020; x += 48) {
  village.objects.push({ kind: 'tree', x, y: 66 }, { kind: 'tree', x, y: 710 });
}
for (let y = 114; y < 672; y += 48) village.objects.push({ kind: 'tree', x: 30, y }, { kind: 'tree', x: 1026, y });
for (let i = 0; i < 100; i++) {
  const x = 85 + (i * 97) % 880, y = 95 + (i * 71) % 550;
  if (isPath(x, y) || isWater(x, y) || (x > 160 && x < 340 && y < 252) || (x > 690 && x < 890 && y < 252)) continue;
  village.objects.push({ kind: i % 4 ? 'flower' : 'bush', x, y, variant: i % 3 });
}
for (const object of village.objects) {
  let rect: Rect | undefined;
  if (object.kind === 'tree' || object.kind === 'blossom') rect = { x: object.x - 7, y: object.y - 11, width: 14, height: 13 };
  if (object.kind === 'npc') rect = { x: object.x - 6, y: object.y - 5, width: 12, height: 9 };
  if (object.kind === 'rock') rect = { x: object.x - 12, y: object.y - 10, width: 24, height: 14 };
  if (object.kind === 'bench') rect = { x: object.x - 22, y: object.y - 12, width: 44, height: 14 };
  if (object.kind === 'crystal') rect = { x: object.x - 12, y: object.y - 12, width: 24, height: 12 };
  if (rect) village.solids.push(rect);
}

function interior(id: 'home' | 'lab', cols: number, rows: number): SceneMap {
  const width = cols * TILE, height = rows * TILE;
  return { id, title: id === 'home' ? 'Casa de Liz' : 'Laboratorio tecnológico', width, height, spawn: { x: width / 2, y: height - 62 }, objects: [], interactions: [], solids: [
    { x: 0, y: 0, width, height: 48 }, { x: 0, y: height - 24, width, height: 24 },
    { x: 0, y: 0, width: 24, height }, { x: width - 24, y: 0, width: 24, height },
  ] };
}
const home = interior('home', 20, 15);
home.objects.push({ kind: 'rug', x: 240, y: 265 }, { kind: 'desk', x: 168, y: 144 }, { kind: 'bed', x: 384, y: 180 }, { kind: 'bookshelf', x: 72, y: 120 }, { kind: 'plant', x: 72, y: 252 }, { kind: 'plant', x: 408, y: 276 }, { kind: 'npc', x: 288, y: 180, variant: 0 }, { kind: 'door', x: 240, y: 336 });
home.solids.push({ x: 120, y: 110, width: 96, height: 36 }, { x: 360, y: 120, width: 48, height: 65 }, { x: 48, y: 78, width: 48, height: 44 });
home.interactions.push({ id: 'home-story', kind: 'bio', x: 168, y: 158, label: 'Leer mi historia' }, { id: 'home-liz', kind: 'bio', x: 288, y: 192, label: 'Conocer a Liz' }, { id: 'home-exit', kind: 'exit', x: 240, y: 326, label: 'Volver al pueblo' });
const lab = interior('lab', 24, 17);
lab.objects.push({ kind: 'rug', x: 288, y: 340 }, { kind: 'npc', x: 192, y: 264, variant: 2 }, { kind: 'plant', x: 72, y: 312 }, { kind: 'plant', x: 504, y: 312 }, { kind: 'bookshelf', x: 72, y: 120 }, { kind: 'door', x: 288, y: 384 });
[{ x: 168, y: 144 }, { x: 312, y: 144 }, { x: 456, y: 144 }, { x: 456, y: 288 }].forEach((p, index) => {
  lab.objects.push({ kind: 'computer', ...p, variant: index });
  lab.solids.push({ x: p.x - 24, y: p.y - 22, width: 48, height: 24 });
  lab.interactions.push({ id: `terminal-${index}`, kind: 'technology', index, x: p.x, y: p.y + 16, label: ['Frontend', 'Backend', 'Bases de datos', 'Herramientas'][index] });
});
lab.interactions.push({ id: 'lab-interests', kind: 'interests', x: 192, y: 276, label: 'Descubrir mis intereses' }, { id: 'lab-exit', kind: 'exit', x: 288, y: 374, label: 'Volver al pueblo' });

for (const room of [home, lab]) for (const object of room.objects) {
  if (object.kind === 'npc' || object.kind === 'plant') room.solids.push({ x: object.x - 6, y: object.y - 5, width: 12, height: 9 });
}

export const SCENES: Record<SceneId, SceneMap> = { village, home, lab };
export function sceneSolids(id: SceneId): readonly Rect[] { return SCENES[id].solids; }
