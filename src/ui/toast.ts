import { el } from './dom';

export class Toast {
  readonly element = el('div', {
    className: 'toast',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });
  private timer = 0;

  show(message: string, duration = 2600): void {
    this.element.textContent = message;
    this.element.classList.add('is-shown');
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.element.classList.remove('is-shown');
    }, duration);
  }

  hide(): void {
    window.clearTimeout(this.timer);
    this.element.classList.remove('is-shown');
  }
}