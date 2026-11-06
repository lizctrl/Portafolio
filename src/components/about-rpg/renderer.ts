import { PixelArt } from './art';
import { SCENES, isPath, isWater } from './map';
import { TILE, type RPGState, type MapObject } from './model';

const art = new PixelArt();
function drawObject(c: CanvasRenderingContext2D, object: MapObject, state: RPGState, reduced: boolean) {
  const time = reduced ? 0 : state.time;
  const { kind, x, y, variant = 0 } = object;
  if (kind === 'npc') {
    const image = art.character('down', 1, variant);
    c.fillStyle = '#34405133'; c.fillRect(x - 8, y - 3, 16, 5);
    c.drawImage(image, Math.round(x - 12), Math.round(y - 32 + (Math.sin(time * 1.4 + x) > .95 ? 1 : 0)));
    return;
  }
  const image = art.sprite(kind, variant);
  const sway = !reduced && (kind === 'tree' || kind === 'blossom' || kind === 'flower') ? Math.round(Math.sin(time * .7 + x) * .6) : 0;
  if (kind === 'portal') {
    const glow = c.createRadialGradient(x, y - 45, 3, x, y - 45, 55);
    glow.addColorStop(0, '#c4b5fd35'); glow.addColorStop(1, '#c4b5fd00'); c.fillStyle = glow; c.fillRect(x - 60, y - 100, 120, 120);
  }
  c.drawImage(image, Math.round(x - image.width / 2 + sway), Math.round(y - image.height));
  if (kind === 'portal') {
    for (let i = 0; i < 8; i++) { const dx = Math.sin(time * .6 + i * 2.4) * 9, dy = (i * 9 + time * 6) % 42; c.fillStyle = i % 2 ? '#c4b5fd' : '#e7c9ee'; c.fillRect(Math.round(x + dx), Math.round(y - 70 + dy), 1, 1); }
  }
  if (kind === 'lamp' || kind === 'computer' || kind === 'lab') {
    const lx = kind === 'lab' ? x : kind === 'computer' ? x + 12 : x, ly = y - (kind === 'lab' ? 98 : kind === 'computer' ? 41 : 44);
    c.globalAlpha = .6 + Math.sin(time + x) * .12; c.fillStyle = '#e5d5f4'; c.fillRect(lx - 1, ly, 2, 2); c.globalAlpha = 1;
  }
  if (kind === 'sign' && object.label) {
    c.font = '6px monospace'; c.textAlign = 'center';
    const size = Math.ceil(c.measureText(object.label).width) + 8;
    c.fillStyle = '#554561df'; c.fillRect(x - size / 2, y - 42, size, 11);
    c.fillStyle = '#ede0f6'; c.fillText(object.label, x, y - 34);
  }
  if (kind === 'crystal') {
    const id = `motivation-${variant}`;
    if (state.visits.has(id)) { c.fillStyle = '#eee0f5'; c.fillRect(x - 3, y - 45, 2, 2); c.fillRect(x - 1, y - 43, 2, 2); c.fillRect(x + 1, y - 45, 2, 2); c.fillRect(x + 3, y - 47, 2, 2); }
    if (!reduced) { c.fillStyle = '#e5c8ef88'; c.fillRect(x + 11, Math.round(y - 19 - (time * 4 + variant * 3) % 17), 1, 1); }
  }
}

export function renderRPG(c: CanvasRenderingContext2D, state: RPGState, width: number, height: number, reduced: boolean): void {
  const map = SCENES[state.scene];
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#242238'; c.fillRect(0, 0, width, height);
  const camera = { x: Math.round(state.camera.x), y: Math.round(state.camera.y) };
  c.save(); c.translate(-camera.x, -camera.y);
  const phase = reduced ? 0 : Math.floor(state.time * 2) % 3;
  const left = Math.max(0, Math.floor(camera.x / TILE)), top = Math.max(0, Math.floor(camera.y / TILE));
  const right = Math.min(map.width / TILE, Math.ceil((camera.x + width) / TILE)), bottom = Math.min(map.height / TILE, Math.ceil((camera.y + height) / TILE));
  for (let ty = top; ty < bottom; ty++) for (let tx = left; tx < right; tx++) {
    const x = tx * TILE, y = ty * TILE, variant = (tx * 7 + ty * 11) % 4;
    const tile = state.scene !== 'village' ? y < 48 || tx === 0 || x >= map.width - 24 || y >= map.height - 24 ? 'wall' : state.scene === 'home' ? 'wood' : 'floor' : isWater(x, y) ? 'water' : isPath(x, y) ? 'path' : 'grass';
    c.drawImage(art.tile(tile, variant, tile === 'water' ? phase : 0), x, y);
    if (state.scene === 'village' && tile === 'path') {
      c.fillStyle = '#8f969b88';
      if (!isPath(x - 1, y)) c.fillRect(x, y, 2, 24);
      if (!isPath(x + 24, y)) c.fillRect(x + 22, y, 2, 24);
      if (!isPath(x, y - 1)) c.fillRect(x, y, 24, 2);
    }
    if (tile === 'water') { c.fillStyle = '#b1b4c4'; if (!isWater(x, y - 1)) c.fillRect(x, y, 24, 3); if (!isWater(x - 1, y)) c.fillRect(x, y, 3, 24); if (!isWater(x + 24, y)) c.fillRect(x + 21, y, 3, 24); if (!isWater(x, y + 24)) c.fillRect(x, y + 21, 24, 3); }
  }
  const visible = map.objects.filter((o) => o.x > camera.x - 120 && o.x < camera.x + width + 120 && o.y > camera.y - 40 && o.y < camera.y + height + 170);
  // Ground rugs render below characters; all upright sprites sort by their feet.
  visible.filter((o) => o.kind === 'rug').forEach((o) => drawObject(c, o, state, reduced));
  const layers: { y: number; object?: MapObject }[] = visible.filter((o) => o.kind !== 'rug').map((object) => ({ y: object.y, object }));
  layers.push({ y: state.player.y }); layers.sort((a, b) => a.y - b.y);
  for (const item of layers) {
    if (item.object) drawObject(c, item.object, state, reduced);
    else {
      const p = state.player, frame = p.moving ? Math.floor(p.phase) % 3 : 1;
      const bounce = state.celebration > 0 && !reduced ? Math.abs(Math.sin(state.celebration * 7)) * 3 : 0;
      c.fillStyle = '#31334444'; c.fillRect(Math.round(p.x - 7), Math.round(p.y - 2), 14, 4);
      c.drawImage(art.character(p.facing, frame, 0), Math.round(p.x - 12), Math.round(p.y - 32 - bounce));
      if (p.interact > 0 && !reduced) { c.fillStyle = '#e6d4f3'; c.fillRect(Math.round(p.x + 10), Math.round(p.y - 31), 2, 3); }
    }
  }
  if (!reduced) {
    state.particles.forEach((p) => { c.globalAlpha = 1 - p.age / p.life; c.fillStyle = '#e7ccf2'; c.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }); c.globalAlpha = 1;
    for (let i = 0; i < 12; i++) { const px = camera.x + (i * 83 + Math.sin(state.time * .15 + i) * 4 + map.width) % width; const py = camera.y + (i * 59 + Math.sin(state.time * .3 + i) * 6 + map.height) % height; c.fillStyle = i % 3 ? '#f0d2e95c' : '#c7b4ef88'; c.fillRect(Math.round(px), Math.round(py), 1, 1); }
  }
  c.restore();
  // Subtle scene-wide violet tint ties the original pixel palette to the portfolio.
  c.fillStyle = '#462c6c0c'; c.fillRect(0, 0, width, height);
  const near = map.interactions.find((item) => item.id === state.nearest);
  if (near) {
    const x = Math.round(near.x - camera.x), y = Math.round(near.y - camera.y - 48);
    c.fillStyle = '#f1e2ff'; c.fillRect(x - 6, y - 10, 13, 12); c.fillRect(x - 3, y + 2, 7, 2); c.fillStyle = '#65517f'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('E', x + 1, y - 1);
  }
}

export function portraitURL(variant = 0): string { return art.character('down', 1, variant).toDataURL(); }
