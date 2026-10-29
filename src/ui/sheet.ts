import { el } from './dom';
import { icon } from './icons';

export interface SheetHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

export class Sheet {
  readonly backdrop = el('div', { className: 'sheet-backdrop' });
  readonly element: HTMLDivElement;
  readonly body = el('div', { className: 'sheet__body' });
  private readonly titleNode: HTMLHeadingElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly handlers: SheetHandlers;
  private openState = false;
  private lastFocus: HTMLElement | null = null;
    private hideTimer = 0;

  constructor(handlers: SheetHandlers = {}) {
    this.handlers = handlers;
    this.titleNode = el('h2', { className: 'sheet__title', attrs: { id: 'sheet-title' } });
    this.closeButton = el(
      'button',
      {
        className: 'icon-btn',
        attrs: { type: 'button', 'aria-label': 'Tutup' },
        on: { click: () => this.close() }
      },
      [el('span', { html: icon('close', 18) })]
    );
    this.element = el(
      'div',
      {
        className: 'sheet',
        attrs: {
          role: 'dialog',
          'aria-modal': 'false',
          'aria-labelledby': 'sheet-title'
        }
      },
      [
        el('div', { className: 'sheet__grip', attrs: { 'aria-hidden': 'true' } }),
        el('div', { className: 'sheet__head' }, [this.titleNode, this.closeButton]),
        this.body
      ]
    );

    this.backdrop.addEventListener('click', () => this.close());
        this.element.hidden = true;
        this.backdrop.hidden = true;
        window.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.openState) {
      event.stopPropagation();
      this.close();
    }
  };

  setTitle(title: string): void {
    this.titleNode.textContent = title;
  }

    setCloseLabel(label: string): void {
      this.closeButton.setAttribute('aria-label', label);
    }

  setContent(children: Array<Node | string>): void {
    this.body.replaceChildren(...children);
  }

  open(): void {
    if (this.openState) return;
    this.openState = true;
      window.clearTimeout(this.hideTimer);
      this.lastFocus = document.activeElement as HTMLElement | null;
    this.element.hidden = false;
    this.backdrop.hidden = false;
    requestAnimationFrame(() => {
          if (!this.openState) return;
          this.element.classList.add('is-open');
          this.backdrop.classList.add('is-open');
        });
    this.element.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close(): void {
    if (!this.openState) return;
    this.openState = false;
    this.element.classList.remove('is-open');
    this.backdrop.classList.remove('is-open');
        window.clearTimeout(this.hideTimer);
        this.hideTimer = window.setTimeout(() => {
          if (this.openState) return;
          this.element.hidden = true;
          this.backdrop.hidden = true;
        }, 380);
    this.lastFocus?.focus({ preventScroll: true });
    this.handlers.onClose?.();
  }

  isOpen(): boolean {
    return this.openState;
  }
}