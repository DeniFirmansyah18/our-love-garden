import type { BirthdayEvent } from '../data/memories';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';

export interface BirthdayHandlers {
  onEnter: () => void;
}

/** Balloons, cake and one very earnest birthday letter. */
export class BirthdayPanel {
  readonly element: HTMLDivElement;
  private readonly handlers: BirthdayHandlers;
  private open = false;

  constructor(handlers: BirthdayHandlers) {
    this.handlers = handlers;
    this.element = el('div', {
      className: 'birthday',
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'birthday-title', hidden: '' }
    });
    window.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      event.stopPropagation();
      this.close(true);
    }
  };

  show(event: BirthdayEvent): void {
    const lang = getLang();
    this.element.replaceChildren(
      el('div', { className: 'birthday__balloons', attrs: { 'aria-hidden': 'true' } }, [
        ...Array.from({ length: 7 }, (_, index) =>
          el('span', { className: 'birthday__balloon', attrs: { style: `--i:${index}` } })
        )
      ]),
      el('div', { className: `birthday__card birthday__card--${event.character}` }, [
        el('span', { className: 'birthday__cake', html: icon('sparkle', 26) }),
        el('p', {
          className: 'birthday__eyebrow',
          text: `${t('profile.birthday')} · ${event.date.day}/${event.date.month}`
        }),
        el('h2', {
          className: 'birthday__title',
          attrs: { id: 'birthday-title' },
          text: event.title[lang]
        }),
        el('p', { className: 'birthday__message', text: event.message[lang] }),
        el('p', { className: 'birthday__note', text: t('birthday.note') }),
        el(
          'button',
          {
            className: 'btn',
            attrs: { type: 'button' },
            on: { click: () => this.close(true) }
          },
          [el('span', { html: icon('sparkle', 17) }), el('span', { text: t('birthday.continue') })]
        )
      ])
    );
    this.open = true;
    this.element.hidden = false;
        requestAnimationFrame(() => {
          if (!this.open) return;
          this.element.classList.add('is-open');
        });
    this.element.querySelector<HTMLButtonElement>('.btn')?.focus({ preventScroll: true });
  }

  close(entered = false): void {
    if (!this.open) return;
    this.open = false;
    this.element.classList.remove('is-open');
    window.setTimeout(() => {
      if (this.open) return;
      this.element.hidden = true;
    }, 380);
    if (entered) this.handlers.onEnter();
  }

  isOpen(): boolean {
    return this.open;
  }
}