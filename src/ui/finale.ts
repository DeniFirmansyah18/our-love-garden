import { FINALE_LETTER, FINALE_SIGNATURE, FINALE_TITLE, MEMORY_COUNT } from '../data/memories';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';

export interface FinaleHandlers {
  onClose: () => void;
}

/** The last scene: night sky, lanterns and one long letter. */
export class FinalePanel {
  readonly element: HTMLDivElement;
  private readonly handlers: FinaleHandlers;
  private open = false;

  constructor(handlers: FinaleHandlers) {
    this.handlers = handlers;
    const lang = getLang();

    this.element = el(
      'div',
      {
        className: 'finale',
        attrs: {
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'finale-title',
          hidden: ''
        }
      },
      [
        el('div', { className: 'finale__lanterns', attrs: { 'aria-hidden': 'true' } }, [
          ...Array.from({ length: 9 }, (_, index) =>
            el('span', {
              className: 'finale__lantern',
              attrs: { style: `--i:${index}` }
            })
          )
        ]),
        el('div', { className: 'finale__card' }, [
          el('p', { className: 'finale__eyebrow', text: t('finale.night') }),
          el('h2', {
            className: 'finale__title',
            attrs: { id: 'finale-title' },
            text: FINALE_TITLE[lang]
          }),
          el('p', { className: 'finale__letter', text: FINALE_LETTER[lang] }),
          el('p', { className: 'finale__signature', text: FINALE_SIGNATURE[lang] }),
          el('p', { className: 'finale__meta', text: `${MEMORY_COUNT} / ${MEMORY_COUNT} ${t('memory.counter')}` }),
          el(
            'button',
            {
              className: 'btn finale__btn',
              attrs: { type: 'button' },
              on: { click: () => this.close() }
            },
            [el('span', { html: icon('heart', 18) }), el('span', { text: t('finale.close') })]
          )
        ])
      ]
    );
  }

  show(): void {
    this.open = true;
    this.element.hidden = false;
        requestAnimationFrame(() => {
          if (!this.open) return;
          this.element.classList.add('is-open');
        });
    this.element.querySelector<HTMLButtonElement>('.finale__btn')?.focus({ preventScroll: true });
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.element.classList.remove('is-open');
    window.setTimeout(() => {
      if (this.open) return;
      this.element.hidden = true;
    }, 420);
    this.handlers.onClose();
  }

  isOpen(): boolean {
    return this.open;
  }
}