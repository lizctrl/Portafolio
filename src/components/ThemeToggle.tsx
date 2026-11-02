import { h } from '../jsx';
import { Icon } from './Icon';

const STORAGE_KEY = 'tema';

function savedTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Botón de modo oscuro. Su estado vive aquí, como un useState. */
export function ThemeToggle(): Node {
  let dark = (savedTheme() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro')) === 'oscuro';
  const button = (<button type="button" class="theme-toggle" aria-label="Modo oscuro" />) as HTMLButtonElement;

  const render = (): void => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    button.setAttribute('aria-pressed', String(dark));
    button.replaceChildren(<Icon name={dark ? 'sun' : 'moon'} size={18} />);
  };

  button.addEventListener('click', () => {
    dark = !dark;
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'oscuro' : 'claro');
    } catch {
      // Sin almacenamiento (modo privado): el tema solo dura esta visita.
    }
    render();
  });
  render();
  return button;
}
