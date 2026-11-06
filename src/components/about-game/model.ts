import type { content } from '../../content';

export type AboutData = typeof content.about;
export type PlayerState = 'idle' | 'walk' | 'jump' | 'fall' | 'land' | 'interact';
export interface Platform { x: number; y: number; width: number }
export interface Station { id: number; x: number; title: string; label: string; symbol: 'computer' | 'crystals' | 'spark' | 'portal' }
export interface Player { x: number; y: number; vx: number; vy: number; width: number; height: number; grounded: boolean; facing: 1 | -1; coyote: number; jumpBuffer: number; reaction: number; state: PlayerState }
export interface World { player: Player; camera: number; time: number; visited: Set<number>; particles: Particle[]; nearest: number | null }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }
export const WORLD_WIDTH = 2140;
export const WORLD_HEIGHT = 520;
export const FLOOR = 438;
export const STATIONS: readonly Station[] = [
  { id: 0, x: 290, title: 'WHO AM I?', label: 'Quién soy', symbol: 'computer' },
  { id: 1, x: 790, title: 'WHAT I LOVE', label: 'Lo que me apasiona', symbol: 'crystals' },
  { id: 2, x: 1300, title: 'WHAT DRIVES ME', label: 'Lo que me motiva', symbol: 'spark' },
  { id: 3, x: 1860, title: 'NEXT LEVEL', label: 'Mi próximo nivel', symbol: 'portal' },
];
// Optional elevated paths. All discoveries are also reachable on the continuous floor.
export const PLATFORMS: readonly Platform[] = [
  { x: 405, y: 352, width: 155 },
  { x: 915, y: 328, width: 170 },
  { x: 1440, y: 350, width: 165 },
];
