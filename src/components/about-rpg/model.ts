import type { content } from '../../content';

export type AboutData = typeof content.about;
export type SkillsData = typeof content.skills;
export type SceneId = 'village' | 'home' | 'lab';
export type Facing = 'up' | 'down' | 'left' | 'right';
export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }
export type ArtKind = 'tree' | 'blossom' | 'bush' | 'flower' | 'rock' | 'house' | 'lab' | 'portal' | 'bench' | 'sign' | 'lamp' | 'fountain' | 'crystal' | 'npc' | 'computer' | 'desk' | 'bed' | 'bookshelf' | 'plant' | 'rug' | 'door';
export interface MapObject extends Point { kind: ArtKind; variant?: number; label?: string }
export type InteractionKind = 'welcome' | 'enter-home' | 'enter-lab' | 'exit' | 'bio' | 'interests' | 'technology' | 'gardener' | 'motivation' | 'portal' | 'sign';
export interface Interaction extends Point { id: string; kind: InteractionKind; label: string; index?: number }
export interface SceneMap { id: SceneId; title: string; width: number; height: number; spawn: Point; solids: Rect[]; objects: MapObject[]; interactions: Interaction[] }
export interface Player extends Point { facing: Facing; moving: boolean; phase: number; interact: number }
export interface Particle extends Point { vx: number; vy: number; age: number; life: number }
export interface RPGState { scene: SceneId; player: Player; camera: Point; time: number; quests: Set<number>; motives: Set<number>; visits: Set<string>; particles: Particle[]; celebration: number; nearest: string | null }
export const TILE = 24;
export const QUESTS = ['Conocer a Liz', 'Descubrir sus habilidades', 'Explorar sus motivaciones', 'Encontrar el portal'] as const;
