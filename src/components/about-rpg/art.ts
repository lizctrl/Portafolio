import type { ArtKind, Facing } from './model';

type Surface = HTMLCanvasElement;
const ink = '#343249';
function surface(width: number, height: number): [Surface, CanvasRenderingContext2D] {
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  const ctx = c.getContext('2d')!; ctx.imageSmoothingEnabled = false; return [c, ctx];
}
function rect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h); }
function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) {
  for (let row = -ry; row <= ry; row++) { const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - row * row / (ry * ry)))); rect(c, x - half, y + row, half * 2 + 1, 1, color); }
}
function rng(seed: number) { let n = seed; return () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; }; }

export class PixelArt {
  private cache = new Map<string, Surface>();
  tile(kind: 'grass' | 'path' | 'water' | 'wood' | 'floor' | 'wall', variant = 0, phase = 0): Surface {
    const key = `tile-${kind}-${variant}-${phase}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const [canvas, c] = surface(24, 24), random = rng(variant + 53);
    if (kind === 'grass') {
      rect(c, 0, 0, 24, 24, ['#77988e', '#75958c', '#78998f', '#76978d'][variant % 4]);
      for (let i = 0; i < 14; i++) { const x = Math.floor(random() * 23), y = Math.floor(random() * 23); rect(c, x, y, 1, 2, i % 3 ? '#89a79a' : '#5f857a'); }
      for (let i = 0; i < 3; i++) rect(c, Math.floor(random() * 22), Math.floor(random() * 22), 2, 1, '#a1b4a2');
    } else if (kind === 'path') {
      rect(c, 0, 0, 24, 24, '#b8abb7');
      for (let i = 0; i < 19; i++) rect(c, Math.floor(random() * 24), Math.floor(random() * 24), i % 4 ? 1 : 2, 1, i % 2 ? '#c6b9c2' : '#a396a9');
    } else if (kind === 'water') {
      rect(c, 0, 0, 24, 24, '#699eaf');
      rect(c, (phase * 3 + variant * 5) % 17, 6, 6, 1, '#94c1cd'); rect(c, (phase * 2 + 5) % 16, 16, 7, 1, '#81b4c1'); rect(c, 0, 22, 24, 2, '#6194a8');
    } else if (kind === 'wood') {
      rect(c, 0, 0, 24, 24, '#9c8497');
      for (let y = 0; y < 24; y += 8) { rect(c, 0, y, 24, 1, '#75677f'); rect(c, variant % 2 ? 16 : 7, y, 1, 8, '#83718b'); rect(c, 3, y + 3, 8, 1, '#ad96a5'); }
    } else if (kind === 'floor') {
      rect(c, 0, 0, 24, 24, variant % 2 ? '#a0a6bf' : '#a8afc6'); rect(c, 0, 23, 24, 1, '#78829c'); rect(c, 23, 0, 1, 24, '#7f89a4'); rect(c, 1, 1, 21, 1, '#c1c5d4');
    } else {
      rect(c, 0, 0, 24, 24, '#716b8b'); rect(c, 0, 7, 24, 2, '#b4a7c0'); rect(c, 0, 20, 24, 2, '#504a68'); rect(c, 5, 10, 1, 9, '#867c9d'); rect(c, 18, 10, 1, 9, '#867c9d');
    }
    this.cache.set(key, canvas); return canvas;
  }
  character(facing: Facing, frame: number, variant = 0): Surface {
    const key = `person-${facing}-${frame}-${variant}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const [canvas, c] = surface(24, 34);
    const hair = variant === 1 ? '#70546c' : '#4b3d4d', hairLight = variant === 1 ? '#9b748e' : '#6b5261';
    const jacket = variant === 1 ? '#7b9b88' : variant === 2 ? '#7b9bb3' : '#9d83cd';
    const stride = frame % 3 - 1;
    rect(c, 7, 25 + Math.max(0, stride), 4, 6, '#44435e'); rect(c, 13, 25 + Math.max(0, -stride), 4, 6, '#55516f');
    rect(c, 6, 30 + Math.max(0, stride), 6, 3, '#dcd7e7'); rect(c, 13, 30 + Math.max(0, -stride), 6, 3, '#c8c7dc');
    rect(c, 6, 16, 12, 11, ink); rect(c, 7, 16, 10, 10, jacket);
    rect(c, 10, 17, 4, 8, '#ece0eb'); rect(c, 7, 23, 3, 3, '#7c65ad'); rect(c, 15, 23, 3, 3, '#7c65ad');
    rect(c, 4, 18 + stride, 3, 7, jacket); rect(c, 17, 18 - stride, 3, 7, jacket);
    rect(c, 4, 24 + stride, 3, 2, '#d6ac9a'); rect(c, 17, 24 - stride, 3, 2, '#edc7b1');
    rect(c, 6, 4, 12, 12, hair); rect(c, 4, 7, 3, 10, hair); rect(c, 7, 2, 10, 3, hair); rect(c, 8, 3, 6, 1, hairLight);
    if (facing === 'up') {
      rect(c, 7, 7, 10, 10, hair); rect(c, 8, 6, 2, 9, hairLight); rect(c, 10, 15, 4, 4, hair); rect(c, 10, 15, 4, 2, '#b1a3d9');
    } else {
      const side = facing === 'left' ? -2 : facing === 'right' ? 2 : 0;
      rect(c, 8 + side, 7, 8, 9, '#d8ad9c'); rect(c, 9 + side, 8, 7, 6, '#ecc3ad');
      rect(c, 7, 5, 10, 4, hair); rect(c, 7, 8, 3, 3, hair);
      if (facing === 'down') { rect(c, 9, 10, 3, 3, '#6d5e80'); rect(c, 14, 10, 3, 3, '#6d5e80'); rect(c, 10, 11, 1, 1, '#e7e4f5'); rect(c, 15, 11, 1, 1, '#e7e4f5'); rect(c, 12, 11, 2, 1, '#6d5e80'); }
      else rect(c, facing === 'left' ? 7 : 16, 10, 2, 2, '#514660');
      rect(c, 12 + side, 14, 2, 1, '#a96f83'); rect(c, facing === 'left' ? 17 : 4, 9, 3, 8, hair);
    }
    this.cache.set(key, canvas); return canvas;
  }
  sprite(kind: ArtKind, variant = 0): Surface {
    const key = `${kind}-${variant}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const large = kind === 'house' || kind === 'lab';
    const [canvas, c] = surface(large ? (kind === 'lab' ? 192 : 168) : kind === 'blossom' ? 84 : kind === 'tree' ? 64 : 96, large ? 144 : kind === 'blossom' ? 100 : kind === 'tree' ? 88 : 96);
    const w = canvas.width, h = canvas.height, mid = w / 2;
    const random = rng(kind.length * 153 + variant * 17);
    if (kind === 'tree' || kind === 'blossom') {
      ellipse(c, mid, h - 5, kind === 'tree' ? 25 : 34, 6, '#30434e44');
      rect(c, mid - 6, h - 30, 12, 25, '#57445b'); rect(c, mid - 3, h - 28, 4, 22, '#836479');
      if (kind === 'tree') {
        for (let layer = 2; layer >= 0; layer--) {
          const top = 4 + layer * 17, radius = 16 + layer * 6;
          for (let y = 0; y < 32; y += 2) { const half = Math.min(radius, Math.floor(y * .8) + 3); rect(c, mid - half, top + y, half * 2, 2, y > 26 ? '#284951' : '#37655f'); }
          for (let i = 0; i < 27; i++) { const x = mid - radius + random() * radius * 2, y = top + 8 + random() * 23; if (Math.abs(x - mid) < (y - top) * .7) rect(c, x, y, 3, 2, i % 3 ? '#4d7c70' : '#618e7d'); }
        }
      } else {
        ellipse(c, mid, 51, 36, 25, '#796392'); ellipse(c, mid - 20, 42, 19, 20, '#9c7eb4'); ellipse(c, mid + 17, 38, 22, 23, '#a98bc2'); ellipse(c, mid - 3, 29, 29, 23, '#b799ce');
        ellipse(c, mid - 13, 26, 16, 15, '#c4a5d8'); ellipse(c, mid + 12, 19, 14, 13, '#d4b6df');
        for (let i = 0; i < 150; i++) { const x = 9 + random() * 66, y = 10 + random() * 54; if (((x - mid) / 34) ** 2 + ((y - 38) / 29) ** 2 < 1) rect(c, x, y, i % 4 ? 2 : 3, 2, ['#c6a8d8', '#dfc4e5', '#a586b9', '#bc99ce'][i % 4]); }
      }
    } else if (large) {
      ellipse(c, mid, h - 3, mid - 3, 4, '#34304733');
      rect(c, 8, 57, w - 16, 80, '#686b89'); rect(c, 10, 59, w - 20, 73, '#bac0ce');
      for (let y = 64; y < 130; y += 7) { rect(c, 12, y, w - 24, 1, '#9ba3bd'); for (let x = y % 14 ? 17 : 26; x < w - 20; x += 18) rect(c, x, y, 1, 6, '#aeb4c8'); }
      for (let y = 0; y < 74; y += 2) { const inset = Math.max(0, 24 - Math.floor(y / 3)); rect(c, inset, y, w - inset * 2, 2, y < 4 ? '#747da4' : y > 68 ? '#303c68' : '#414f83'); }
      for (let y = 8; y < 66; y += 7) for (let x = 30 + ((y / 7) % 2) * 4; x < w - 24; x += 9) { rect(c, x, y, 5, 2, '#61729e'); rect(c, x + 4, y + 2, 2, 3, '#4f618f'); }
      if (kind === 'lab') { rect(c, 26, 20, 46, 32, '#293956'); rect(c, w - 72, 20, 46, 32, '#293956'); for (let i = 0; i < 4; i++) { rect(c, 29 + i * 11, 23, 8, 26, '#6f93b2'); rect(c, w - 69 + i * 11, 23, 8, 26, '#6f93b2'); } rect(c, mid - 11, 9, 22, 24, '#c4b5d9'); rect(c, mid - 6, 14, 12, 12, '#7b83ad'); }
      for (const x of [25, w - 49]) {
        rect(c, x - 3, 84, 30, 39, '#697898'); rect(c, x, 86, 24, 33, '#e0deec'); rect(c, x + 3, 89, 18, 27, '#88abc7'); rect(c, x + 5, 90, 5, 17, '#bfd6e0'); rect(c, x + 10, 87, 2, 32, '#dcdcea'); rect(c, x + 1, 103, 22, 2, '#dcdcea');
      }
      rect(c, mid - 19, 92, 38, 45, '#737e9f'); rect(c, mid - 14, 99, 28, 36, '#3b4568'); rect(c, mid - 10, 104, 20, 22, '#8c90b2'); rect(c, mid + 6, 117, 2, 2, '#e7dcba');
      for (let i = 0; i < 3; i++) rect(c, mid - 24 - i * 3, 134 + i * 3, 48 + i * 6, 3, i % 2 ? '#66708e' : '#c3c5d3');
      rect(c, 5, 125, 15, 7, '#7d648a'); rect(c, 8, 115, 9, 10, '#658576'); rect(c, w - 20, 125, 15, 7, '#7d648a'); rect(c, w - 17, 115, 9, 10, '#658576');
    } else if (kind === 'flower' || kind === 'bush' || kind === 'plant') {
      const y = h - 9;
      if (kind === 'plant') rect(c, mid - 6, y - 6, 12, 11, '#9b7b94');
      ellipse(c, mid, y - 4, kind === 'bush' ? 13 : 8, kind === 'bush' ? 9 : 6, '#4f7468');
      for (let i = 0; i < (kind === 'bush' ? 8 : 4); i++) { const x = mid - 8 + Math.floor(random() * 15), yy = y - Math.floor(random() * 9); rect(c, x, yy, 3, 2, '#86a584'); if (kind === 'flower') { rect(c, x - 1, yy - 1, 3, 1, ['#dfb2d1', '#d8c7e8', '#e4d8b7'][variant % 3]); rect(c, x, yy - 2, 1, 3, '#e4c7df'); } }
    } else if (kind === 'rock') {
      ellipse(c, mid, h - 5, 15, 5, '#40505a44'); rect(c, mid - 13, h - 17, 26, 13, '#696d87'); rect(c, mid - 9, h - 22, 18, 5, '#9093aa'); rect(c, mid - 10, h - 17, 9, 4, '#a7a7ba'); rect(c, mid + 7, h - 13, 5, 7, '#555e77');
    } else if (kind === 'bench') {
      rect(c, mid - 20, h - 21, 4, 18, '#5b566b'); rect(c, mid + 16, h - 21, 4, 18, '#5b566b'); rect(c, mid - 23, h - 24, 46, 5, '#a18a9e'); rect(c, mid - 23, h - 16, 46, 5, '#b6a0ae'); rect(c, mid - 23, h - 11, 46, 3, '#7e7089');
    } else if (kind === 'sign') {
      rect(c, mid - 2, h - 15, 4, 14, '#726178'); rect(c, mid - 15, h - 29, 30, 17, '#5f5876'); rect(c, mid - 13, h - 27, 26, 12, '#c2b2c9'); rect(c, mid - 1, h - 24, 2, 6, '#74618b'); rect(c, mid - 1, h - 26, 2, 1, '#74618b');
    } else if (kind === 'lamp') {
      rect(c, mid - 3, h - 43, 6, 41, '#565976'); rect(c, mid - 6, h - 49, 12, 13, '#49435f'); rect(c, mid - 4, h - 47, 8, 8, '#e8d7c7'); rect(c, mid - 6, h - 51, 12, 3, '#9081a5');
    } else if (kind === 'fountain') {
      ellipse(c, mid, h - 6, 31, 10, '#666a8a'); ellipse(c, mid, h - 10, 30, 10, '#bcc1cf'); ellipse(c, mid, h - 11, 25, 7, '#799faf'); rect(c, mid - 6, h - 37, 12, 25, '#969bb7'); ellipse(c, mid, h - 34, 19, 6, '#c0bed3'); ellipse(c, mid, h - 36, 15, 4, '#8db5c3'); rect(c, mid - 2, h - 44, 4, 8, '#d1c5e1');
    } else if (kind === 'crystal') {
      ellipse(c, mid, h - 5, 16, 6, '#826e93'); ellipse(c, mid, h - 8, 15, 6, '#b29cc2');
      for (let row = 0; row < 22; row++) { const half = row < 11 ? Math.floor(row / 2) : Math.floor((22 - row) / 2); rect(c, mid - half, h - 34 + row, half * 2 + 1, 1, row % 3 ? ['#bd9edf', '#ccacde', '#aaa3d7', '#b1bfdc'][variant % 4] : '#e7d7ef'); }
      rect(c, mid - 8, h - 13, 3, 3, '#d9c0dd'); rect(c, mid + 7, h - 10, 3, 3, '#9e80ad');
    } else if (kind === 'portal') {
      ellipse(c, mid, h - 7, 32, 8, '#7a6e93'); ellipse(c, mid, h - 11, 28, 6, '#b9a3ce');
      ellipse(c, mid, h - 46, 26, 37, '#685579'); ellipse(c, mid, h - 47, 22, 35, '#d0b5df'); ellipse(c, mid, h - 47, 16, 28, '#75538e'); ellipse(c, mid, h - 47, 13, 26, '#3e325e');
      for (let y = h - 69; y < h - 19; y += 12) { rect(c, mid - 25, y, 8, 2, '#9e88b4'); rect(c, mid + 18, y + 5, 8, 2, '#9e88b4'); }
      rect(c, mid - 4, h - 87, 8, 7, '#dec4ef');
    } else if (kind === 'computer' || kind === 'desk') {
      rect(c, mid - 30, h - 22, 60, 9, '#62516c'); rect(c, mid - 28, h - 14, 5, 12, '#5d536a'); rect(c, mid + 23, h - 14, 5, 12, '#5d536a'); rect(c, mid - 30, h - 25, 60, 7, '#b098ad');
      rect(c, mid - 17, h - 53, 34, 25, '#454662'); rect(c, mid - 14, h - 50, 28, 18, '#9ac4cc'); rect(c, mid - 11, h - 46, 15, 2, '#d0e0e3'); rect(c, mid - 11, h - 41, 9, 2, '#527b95'); rect(c, mid - 11, h - 36, 20, 1, '#6c9ba8'); rect(c, mid - 2, h - 28, 4, 5, '#59526e'); rect(c, mid - 10, h - 20, 20, 3, '#d0c4da'); rect(c, mid + 20, h - 34, 5, 10, '#9582ad');
    } else if (kind === 'bookshelf') {
      rect(c, mid - 24, h - 59, 48, 54, '#6f5c76');
      for (let y = h - 53; y < h - 8; y += 15) { rect(c, mid - 21, y, 42, 13, '#443d55'); for (let i = 0; i < 9; i++) rect(c, mid - 19 + i * 4, y + 2 + i % 3, 3, 10 - i % 3, ['#b8a4c6', '#859eaf', '#c6a6ae', '#95a394'][i % 4]); rect(c, mid - 23, y + 13, 46, 3, '#ab8fa8'); }
    } else if (kind === 'bed') {
      rect(c, mid - 22, h - 70, 44, 67, '#665775'); rect(c, mid - 19, h - 66, 38, 60, '#dfd1e3'); rect(c, mid - 16, h - 62, 32, 14, '#e4e2ec'); rect(c, mid - 19, h - 44, 38, 37, '#8d83b8'); rect(c, mid - 17, h - 43, 34, 4, '#bfb0dc');
    } else if (kind === 'rug') {
      rect(c, mid - 44, h - 57, 88, 55, '#9d81a4'); rect(c, mid - 42, h - 55, 84, 51, '#b99cbd'); rect(c, mid - 36, h - 49, 72, 39, '#847295'); rect(c, mid - 33, h - 46, 66, 33, '#9781a6');
    } else if (kind === 'door') {
      rect(c, mid - 17, h - 18, 34, 17, '#c6b5c9'); rect(c, mid - 13, h - 15, 26, 13, '#89718e'); rect(c, mid - 4, h - 10, 8, 2, '#e4d3e7'); rect(c, mid - 2, h - 8, 4, 3, '#e4d3e7');
    }
    this.cache.set(key, canvas); return canvas;
  }
}
