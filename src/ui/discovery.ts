import { el } from './dom';
import { icon } from './icons';

export type DiscoveryKind = 'zone' | 'spot' | 'cave';

interface Entry {
  kind: DiscoveryKind;
  title: string;
  subtitle: string;
  label: string;
}

export class DiscoveryBanner {
  readonly element: HTMLDivElement;
  private readonly iconBox = el('span', { className: 'discovery__icon' });
  private readonly label = el('span', { className: 'discovery__label' });
  private readonly title = el('strong', { className: 'discovery__title' });
  private readonly subtitle = el('p', { className: 'discovery__subtitle' });
  private queue: Entry[] = [];
  private timer = 0;
  private showing = false;

  constructor() {
    this.element = el(
      'div',
      {
        className: 'discovery',
        attrs: { role: 'status', 'aria-live': 'polite' }
      },
      [
        this.iconBox,
        el('div', { className: 'discovery__text' }, [this.label, this.title, this.subtitle])
      ]
    );
  }

  show(kind: DiscoveryKind, title: string, subtitle: string, label: string): void {
    this.queue.push({ kind, title, subtitle, label });
    if (!this.showing) this.next();
  }

  private next(): void {
    const entry = this.queue.shift();
    if (!entry) {
      this.showing = false;
      return;
    }
    this.showing = true;
    this.label.textContent = entry.label;
    this.title.textContent = entry.title;
    this.subtitle.textContent = entry.subtitle;
    this.iconBox.innerHTML = icon(entry.kind === 'spot' ? 'flower' : entry.kind === 'cave' ? 'sparkle' : 'globe', 22);
    this.element.dataset.kind = entry.kind;
    this.element.classList.add('is-shown');

    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.element.classList.remove('is-shown');
      window.setTimeout(() => this.next(), 380);
    }, 3200);
  }

  clear(): void {
    this.queue = [];
    window.clearTimeout(this.timer);
    this.element.classList.remove('is-shown');
    this.showing = false;
  }
}