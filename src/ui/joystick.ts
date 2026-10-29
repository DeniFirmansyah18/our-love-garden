import { el } from './dom';

const MAX_RADIUS = 36;

export class Joystick {
  readonly element: HTMLDivElement;
  readonly vector = { x: 0, z: 0 };
  private readonly nub: HTMLDivElement;
  private pointerId: number | null = null;

  constructor(hint = '', label = 'Joystick') {
    this.nub = el('div', { className: 'joystick__nub' });
    this.element = el(
      'div',
      {
        className: 'joystick',
        attrs: {
          role: 'group',
            'aria-label': label
        }
      },
      [this.nub, hint ? el('span', { className: 'joystick__hint', text: hint }) : null]
    );

    this.element.addEventListener('pointerdown', this.onDown);
    this.element.addEventListener('pointermove', this.onMove);
    this.element.addEventListener('pointerup', this.onUp);
    this.element.addEventListener('pointercancel', this.onUp);
  }

  private onDown = (event: PointerEvent): void => {
    this.pointerId = event.pointerId;
      try {
        this.element.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already-released pointers cannot be captured.
      }
      this.updateFromEvent(event);
      event.preventDefault();
    };

  private onMove = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.updateFromEvent(event);
    event.preventDefault();
  };

  private onUp = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.pointerId = null;
    this.reset();
  };

  private updateFromEvent(event: PointerEvent): void {
    const rect = this.element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = event.clientX - cx;
    let dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy);
    if (distance > MAX_RADIUS) {
      dx = (dx / distance) * MAX_RADIUS;
      dy = (dy / distance) * MAX_RADIUS;
    }
    this.nub.style.transform = `translate(${dx}px, ${dy}px)`;
    this.vector.x = dx / MAX_RADIUS;
    this.vector.z = dy / MAX_RADIUS;
  }

  reset(): void {
    this.vector.x = 0;
    this.vector.z = 0;
    this.nub.style.transform = 'translate(0px, 0px)';
  }

  isActive(): boolean {
    return this.pointerId !== null;
  }
}