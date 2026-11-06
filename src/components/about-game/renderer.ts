import { FLOOR, WORLD_WIDTH, WORLD_HEIGHT, PLATFORMS, STATIONS, type World, type Station } from './model';
import { portalReady } from './physics';

const palette = { ink: '#120d1f', violet: '#8b5cf6', lavender: '#c4b5fd', white: '#f5f0ff', muted: '#b9aecf' };
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number, fill: string, stroke?: string) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}
function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .65, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * .65, y); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}

function drawStation(ctx: CanvasRenderingContext2D, station: Station, world: World, reduced: boolean) {
  const near = world.nearest === station.id;
  const found = world.visited.has(station.id);
  const ready = station.id !== 3 || portalReady(world);
  const time = reduced ? 0 : world.time;
  const bob = Math.sin(time * 1.6 + station.id) * 3;
  ctx.save(); ctx.translate(station.x, FLOOR);
  const glow = ctx.createRadialGradient(0, -35, 0, 0, -35, near ? 110 : 80);
  glow.addColorStop(0, near ? '#ad8bff33' : '#ad8bff0e'); glow.addColorStop(1, '#ad8bff00');
  ctx.fillStyle = glow; ctx.fillRect(-115, -150, 230, 185);
  ctx.fillStyle = '#0c071855'; ctx.beginPath(); ctx.ellipse(0, 0, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
  rounded(ctx, -47, -9, 94, 11, 5, '#2e224d', found ? '#c4b5fd88' : '#76618d66');
  ctx.strokeStyle = found || near ? '#c4b5fd' : '#5b4775'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-29, -8); ctx.lineTo(29, -8); ctx.stroke();
  ctx.save(); ctx.translate(0, bob);
  ctx.shadowColor = palette.violet; ctx.shadowBlur = near ? 17 : 5;
  if (station.symbol === 'computer') {
    rounded(ctx, -39, -85, 78, 52, 9, '#251c3b', near || found ? '#c4b5fd' : '#8d75b0');
    rounded(ctx, -33, -79, 66, 38, 5, '#171127');
    ctx.shadowBlur = 0; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#c4b5fd'; ctx.fillText('</>', 0, -54);
    rounded(ctx, -4, -31, 8, 15, 2, '#8c73af'); rounded(ctx, -18, -18, 36, 4, 2, '#b29bcc');
  } else if (station.symbol === 'crystals') {
    diamond(ctx, -25, -51 + Math.sin(time * 1.2) * 3, 16, '#9273c8');
    diamond(ctx, 0, -67, 24, '#c4b5fd'); diamond(ctx, 27, -45 - Math.sin(time * 1.2) * 3, 15, '#8b5cf6');
    ctx.strokeStyle = '#f5f0ff88'; ctx.beginPath(); ctx.moveTo(0, -91); ctx.lineTo(0, -43); ctx.stroke();
  } else if (station.symbol === 'spark') {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const r = i % 2 === 0 ? 30 : 9; if (i === 0) ctx.moveTo(Math.cos(a) * r, -62 + Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, -62 + Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#d6c4ff'; ctx.fill();
    diamond(ctx, 0, -62, 11, '#8b5cf6');
  } else {
    ctx.shadowBlur = ready ? 22 : 0; ctx.shadowColor = '#b696f9';
    ctx.beginPath(); ctx.ellipse(0, -57, 32, 53, 0, 0, Math.PI * 2);
    ctx.fillStyle = ready ? '#9e76ec20' : '#4d3e6222'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ready ? '#c4b5fd' : '#6e5a85'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -57, 24, 43, 0, 0, Math.PI * 2); ctx.lineWidth = 1; ctx.strokeStyle = ready ? '#e5d6ff77' : '#6e5a8544'; ctx.stroke();
    if (ready) { ctx.fillStyle = '#e9ddff'; ctx.beginPath(); ctx.arc(0, -57, 4 + Math.sin(time * 2), 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore(); ctx.shadowBlur = 0;
  ctx.font = '600 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = found ? '#d5c3f7' : '#a997bf';
  ctx.fillText(`${String(station.id + 1).padStart(2, '0')} / ${station.label.toLocaleUpperCase('es')}`, 0, 30);
  if (found) {
    ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-5, -123); ctx.lineTo(-1, -119); ctx.lineTo(6, -127); ctx.stroke();
  }
  if (near) {
    rounded(ctx, -56, -160, 112, 25, 12, '#c4b5fd');
    ctx.font = '600 10px system-ui'; ctx.fillStyle = '#211536'; ctx.fillText(station.id === 3 && !ready ? 'E · Ver el portal' : found ? 'E · Volver a ver' : 'E · Descubrir', 0, -144);
  }
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: World, reduced: boolean) {
  const p = world.player;
  const time = reduced ? 0 : world.time;
  const airborne = !p.grounded;
  const walk = p.state === 'walk' ? Math.sin(time * 14) : 0;
  const bob = p.state === 'idle' ? Math.sin(time * 2) * 1 : Math.abs(walk) * 1.2;
  const squash = p.state === 'land' ? .87 : p.state === 'jump' ? 1.05 : 1;
  const height = Math.max(0, FLOOR - p.y - p.height);
  ctx.save();
  ctx.fillStyle = '#09061455'; ctx.beginPath(); ctx.ellipse(p.x + 15, FLOOR + 3, Math.max(8, 18 - height / 18), 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(p.x + p.width / 2, p.y + p.height);
  ctx.scale(p.facing / squash, squash);
  ctx.translate(0, -bob);
  // Legs and clean sneakers, animated independently from the torso.
  for (const side of [-1, 1]) {
    const stride = airborne ? side * 4 : walk * side * 7;
    ctx.strokeStyle = side < 0 ? '#423951' : '#625275'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(side * 5, -24); ctx.lineTo(side * 4 + stride, -7 + (airborne ? 3 : 0)); ctx.stroke();
    rounded(ctx, side * 4 + stride - 4, -6 + (airborne ? 3 : 0), 12, 5, 2, '#e4d9f7');
  }
  rounded(ctx, -13, -44, 26, 24, 7, '#a78bfa');
  rounded(ctx, -3, -43, 7, 22, 2, '#eee5ff');
  ctx.strokeStyle = '#bfa7ef'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-11, -39); ctx.lineTo(-15 - walk * 4, -25 + (airborne ? -5 : 0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11, -39); ctx.lineTo(16 + walk * 4, p.state === 'interact' ? -54 : airborne ? -36 : -27); ctx.stroke();
  ctx.fillStyle = '#352538'; ctx.beginPath(); ctx.ellipse(-2, -55, 13, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-12, -59, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#dfb6a3'; ctx.beginPath(); ctx.ellipse(4, -53, 9, 10, -.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#352538'; ctx.beginPath(); ctx.ellipse(1, -62, 11, 6, -.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d3c0f4'; ctx.lineWidth = 1.3; ctx.strokeRect(4, -56, 8, 5);
  ctx.fillStyle = '#372a3d'; ctx.fillRect(8, -54, 1.5, 1.5);
  if (p.state === 'interact') { ctx.strokeStyle = '#d5bfff66'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -35, 43, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}

/** Draw world units; the caller owns resizing and the physical camera. */
export function renderWorld(ctx: CanvasRenderingContext2D, world: World, width: number, height: number, dpr: number, reduced: boolean): void {
  const scale = height / WORLD_HEIGHT;
  const viewWidth = width / scale;
  const time = reduced ? 0 : world.time;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.scale(scale, scale);
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#120d1f'); sky.addColorStop(1, '#271b3d'); ctx.fillStyle = sky; ctx.fillRect(0, 0, viewWidth, WORLD_HEIGHT);
  const light = ctx.createRadialGradient(viewWidth * .58, 235, 10, viewWidth * .58, 235, 380);
  light.addColorStop(0, '#9671d41c'); light.addColorStop(1, '#9671d400'); ctx.fillStyle = light; ctx.fillRect(0, 0, viewWidth, WORLD_HEIGHT);
  // Quiet depth layers move only in response to the character/camera.
  for (let i = 0; i < 12; i++) {
    const x = ((i * 211 - world.camera * .14) % (viewWidth + 200) + viewWidth + 200) % (viewWidth + 200) - 100;
    ctx.fillStyle = i % 2 ? '#53406916' : '#7961990d';
    rounded(ctx, x, 140 + (i % 3) * 45, 75 + i % 4 * 30, 300, 12, ctx.fillStyle);
  }
  ctx.strokeStyle = '#b9a0dc12'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(viewWidth * .7 - world.camera * .04, 180, 108, -.8, 3.8); ctx.stroke();
  for (let i = 0; i < 38; i++) {
    const x = (((i * 137 - world.camera * .22) % (viewWidth + 30)) + viewWidth + 30) % (viewWidth + 30);
    const y = 45 + (i * 71) % 310 + Math.sin(time * .35 + i) * 3;
    ctx.fillStyle = i % 4 ? '#c4b5fd25' : '#daceed66'; ctx.beginPath(); ctx.arc(x, y, i % 4 ? 1 : 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save(); ctx.translate(-world.camera, 0);
  ctx.fillStyle = '#171021'; ctx.fillRect(0, FLOOR + 4, WORLD_WIDTH, WORLD_HEIGHT - FLOOR);
  const floorGlow = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 70);
  floorGlow.addColorStop(0, '#aa87e421'); floorGlow.addColorStop(1, '#aa87e400'); ctx.fillStyle = floorGlow; ctx.fillRect(0, FLOOR, WORLD_WIDTH, 70);
  ctx.strokeStyle = '#b49ad455'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, FLOOR + 2); ctx.lineTo(WORLD_WIDTH, FLOOR + 2); ctx.stroke();
  for (let x = 20; x < WORLD_WIDTH; x += 88) { ctx.strokeStyle = '#c4b5fd0c'; ctx.beginPath(); ctx.moveTo(x, FLOOR + 2); ctx.lineTo(x - 35, WORLD_HEIGHT); ctx.stroke(); }
  ctx.strokeStyle = '#c4b5fd0c'; ctx.beginPath(); ctx.moveTo(0, FLOOR + 35); ctx.lineTo(WORLD_WIDTH, FLOOR + 35); ctx.stroke();
  PLATFORMS.forEach((p, index) => {
    const lift = reduced ? 0 : Math.sin(time * .8 + index) * 1.3;
    // Only decorative undersides float; collision surfaces stay completely stable.
    rounded(ctx, p.x + 10, p.y + 7 + lift, p.width - 20, 12, 5, '#100b1b66');
    rounded(ctx, p.x, p.y, p.width, 10, 5, '#3b2b54', '#9475bb55');
    rounded(ctx, p.x + 12, p.y, p.width - 24, 2, 1, '#c4b5fd88');
  });
  STATIONS.forEach((station) => drawStation(ctx, station, world, reduced));
  world.particles.forEach((particle) => { ctx.globalAlpha = particle.life / particle.maxLife; ctx.fillStyle = '#d2b9ff'; ctx.beginPath(); ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2); ctx.fill(); });
  ctx.globalAlpha = 1;
  drawPlayer(ctx, world, reduced);
  ctx.restore();
  // A discreet journey line at the foot of the stage.
  ctx.fillStyle = '#a38bb544'; ctx.fillRect(24, WORLD_HEIGHT - 20, Math.max(0, viewWidth - 48), 1);
  const marker = 24 + (world.player.x / WORLD_WIDTH) * Math.max(0, viewWidth - 48);
  ctx.fillStyle = '#c4b5fd'; ctx.beginPath(); ctx.arc(marker, WORLD_HEIGHT - 19.5, 3, 0, Math.PI * 2); ctx.fill();
}
