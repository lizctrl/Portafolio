export interface DialoguePage { speaker: string; title: string; text: string; portrait: string; content?: HTMLElement; onReveal?(): void }
interface Options { dialog: HTMLDialogElement; signal: AbortSignal; reduced: MediaQueryList; onOpen(): void; onClose(): void }
export function createDialogue({ dialog, signal, reduced, onOpen, onClose }: Options) {
  const find = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;
  const copy = find<HTMLElement>('.rpg-typed');
  const reader = find<HTMLElement>('.rpg-dialog-reader');
  const reveal = find<HTMLButtonElement>('[data-rpg-dialog="reveal"]');
  const next = find<HTMLButtonElement>('[data-rpg-dialog="next"]');
  let pages: DialoguePage[] = [], index = 0, timer: number | undefined, cursor = 0;
  let restore: HTMLElement | null = null, shouldRestore = true;
  const clear = () => { clearInterval(timer); timer = undefined; };
  function finish() { clear(); copy.textContent = pages[index]?.text ?? ''; if (document.activeElement === reveal) next.focus({ preventScroll: true }); reveal.hidden = true; next.textContent = index < pages.length - 1 ? 'Continuar →' : 'Seguir explorando →'; }
  function showPage() {
    clear();
    const page = pages[index]; cursor = 0;
    find<HTMLElement>('.rpg-speaker').textContent = page.speaker;
    find<HTMLElement>('.rpg-dialog-title').textContent = page.title;
    find<HTMLImageElement>('.rpg-dialog-portrait').src = page.portrait;
    find<HTMLImageElement>('.rpg-dialog-portrait').alt = `Retrato de ${page.speaker}`;
    reader.textContent = page.text; copy.textContent = '';
    find<HTMLElement>('.rpg-dialog-extra').replaceChildren(...(page.content ? [page.content] : []));
    find<HTMLElement>('.rpg-dialog-page').textContent = `${index + 1} / ${pages.length}`;
    next.textContent = index < pages.length - 1 ? 'Continuar →' : 'Seguir explorando →';
    reveal.hidden = reduced.matches || !page.text;
    if (reduced.matches || !page.text) finish();
    else timer = window.setInterval(() => { cursor += 2; copy.textContent = page.text.slice(0, cursor); if (cursor >= page.text.length) finish(); }, 22);
    page.onReveal?.();
  }
  function close(restoreFocus = true) { shouldRestore = restoreFocus; clear(); if (dialog.open) dialog.close(); }
  reveal.addEventListener('click', finish, { signal });
  next.addEventListener('click', () => { if (timer) { finish(); return; } if (index < pages.length - 1) { index++; showPage(); } else close(); }, { signal });
  find<HTMLButtonElement>('[data-rpg-dialog="close"]').addEventListener('click', () => close(), { signal });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key === 'Tab') {
      const all = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')).filter((el) => !el.hidden && !!el.getClientRects().length);
      if ((event.shiftKey && document.activeElement === all[0]) || (!event.shiftKey && document.activeElement === all[all.length - 1])) { event.preventDefault(); (event.shiftKey ? all[all.length - 1] : all[0])?.focus(); }
    }
  }, { signal });
  dialog.addEventListener('close', () => { clear(); onClose(); if (shouldRestore) restore?.focus({ preventScroll: true }); }, { signal });
  reduced.addEventListener('change', () => { if (dialog.open && reduced.matches) finish(); }, { signal });
  signal.addEventListener('abort', () => { clear(); if (dialog.open) dialog.close(); }, { once: true });
  return {
    open(nextPages: DialoguePage[], focusReturn: HTMLElement) {
      if (!nextPages.length) return;
      pages = nextPages; index = 0; restore = focusReturn; shouldRestore = true;
      showPage(); if (!dialog.open) dialog.show(); onOpen();
      next.focus({ preventScroll: true });
    },
    close,
    get isOpen() { return dialog.open; },
  };
}
