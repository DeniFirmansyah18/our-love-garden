import { MEMORY_COUNT, type MemoryChest } from '../data/memories';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';

export interface MemoryPanelHandlers {
  onClose: () => void;
  onFinale: () => void;
}

/**
 * A paper letter with a polaroid on top. Photos come from /public/photos; when a
 * file is missing the frame falls back to a drawn paper illustration instead of
 * showing a broken image.
 */
export class MemoryPanel {
  readonly element: HTMLDivElement;
  private readonly card: HTMLDivElement;
  private readonly handlers: MemoryPanelHandlers;
  private open = false;

    constructor(handlers: MemoryPanelHandlers) {
    this.handlers = handlers;
    this.card = el('div', { className: 'memory__card' });
    this.element = el(
      'div',
      {
        className: 'memory',
        attrs: {
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'memory-title',
          hidden: ''
        }
      },
      [this.card]
    );
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      event.stopPropagation();
      this.close();
    }
  };

  show(
    memory: MemoryChest,
    collected: number,
    allOpen: boolean,
    nextHint: string | null
  ): void {
    const lang = getLang();
    this.open = true;
        const children: Array<Node | string> = [
      el('div', { className: 'memory__head' }, [
        el('span', { className: 'memory__eyebrow', text: t('memory.title') }),
        el(
          'button',
          {
            className: 'icon-btn memory__close',
            attrs: { type: 'button', 'aria-label': t('memory.close') },
            on: { click: () => this.close() }
          },
          [el('span', { html: icon('close', 18) })]
        )
      ]),
      this.buildPhoto(memory),
      el('h2', {
        className: 'memory__title',
        attrs: { id: 'memory-title' },
        text: memory.title[lang]
      }),
      el('p', { className: 'memory__letter', text: memory.letter[lang] }),
      el('p', { className: 'memory__signature', text: '— Dudu' }),
      el('div', { className: 'memory__meta' }, [
        el('span', {
          html: `${icon('heart', 13)}<span>${collected} / ${MEMORY_COUNT} ${t('memory.counter')}</span>`
        })
          ])
        ];

        if (nextHint) {
          children.push(
            el('p', { className: 'memory__hint' }, [
              el('strong', { text: `${t('memory.hint')}: ` }),
              el('span', { text: nextHint })
            ])
          );
        }

        children.push(
          el('div', { className: 'memory__actions' }, [
            el(
              'button',
              {
                className: `btn ${allOpen ? '' : 'btn--quiet'}`,
                attrs: { type: 'button' },
                on: {
                  click: () => {
                    if (allOpen) {
                      this.close();
                      this.handlers.onFinale();
                    } else {
                      this.close();
                    }
                  }
                }
              },
              [
                el('span', { html: icon(allOpen ? 'sparkle' : 'check', 17) }),
                el('span', { text: allOpen ? t('memory.openFinale') : t('memory.close') })
              ]
            )
          ])
        );

        this.card.replaceChildren(...children);

        this.element.hidden = false;
        this.element.classList.add('is-open');
        this.card.querySelector<HTMLButtonElement>('.memory__close')?.focus({ preventScroll: true });
      }

  private buildPhoto(memory: MemoryChest): HTMLElement {
    const frame = el('div', { className: 'memory__photo' });
    if (memory.photo) {
      const image = el('img', {
        className: 'memory__image',
        attrs: {
          src: `${import.meta.env.BASE_URL}photos/${memory.photo}`,
          alt: t('memory.photoCaption'),
          loading: 'lazy'
        }
      });
      image.addEventListener('error', () => {
        image.remove();
        frame.classList.add('is-drawn');
      });
      frame.append(image);
          } else {
      frame.classList.add('is-drawn');
    }

    frame.append(
      el('div', { className: 'memory__drawing', html: icon('heart', 44) }),
      el('div', { className: 'memory__tape', attrs: { 'aria-hidden': 'true' } })
    );
    return frame;
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.element.classList.remove('is-open');
    window.setTimeout(() => {
          if (this.open) return;
          this.element.hidden = true;
        }, 320);
    this.handlers.onClose();
  }

  isOpen(): boolean {
    return this.open;
  }
}