import { h } from '../jsx';

// Rejilla de puntos de 6 × 4 (decorativa).
const DOTS = Array.from({ length: 24 }, (_, i) => ({ x: 70 + (i % 6) * 26, y: 470 + Math.floor(i / 6) * 26 }));

/** Fondo decorativo de la portada: formas simples con la paleta violeta y lavanda. */
export function HeroBackground(): Node {
  return (
    <svg class="hero-bg" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <circle class="float-slow" cx="1240" cy="90" r="210" fill="#7c3aed" opacity="0.28" />
      <circle cx="1310" cy="520" r="120" fill="none" stroke="#c4b5fd" stroke-width="2" opacity="0.35" />
      <circle class="float" cx="760" cy="560" r="70" fill="#a78bfa" opacity="0.18" />
      <circle cx="120" cy="90" r="150" fill="#4c2a8a" opacity="0.45" />
      {/* El giro va en el rect y la animación en el grupo, para que no se pisen. */}
      <g class="float">
        <rect x="610" y="60" width="64" height="64" rx="16" fill="none" stroke="#c4b5fd"
          stroke-width="2" opacity="0.4" transform="rotate(20 642 92)" />
      </g>
      <rect x="980" y="430" width="40" height="40" rx="10" fill="#c4b5fd" opacity="0.22" transform="rotate(-15 1000 450)" />
      <path d="M0 600 C 240 520, 420 640, 680 580 S 1120 500, 1440 590" fill="none" stroke="#a78bfa"
        stroke-width="2" opacity="0.35" />
      <path d="M520 260 l14 0 M527 253 l0 14 M1080 200 l14 0 M1087 193 l0 14 M300 380 l12 0 M306 374 l0 12"
        stroke="#c4b5fd" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
      <g fill="#c4b5fd" opacity="0.3">
        {DOTS.map((d) => <circle cx={d.x} cy={d.y} r="2.5" />)}
      </g>
    </svg>
  );
}
