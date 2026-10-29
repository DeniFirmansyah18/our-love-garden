import type { CameraRig } from './camera';

export interface ControlHandlers {
  onTap: (clientX: number, clientY: number) => void;
  onRotate: (dx: number, dy: number) => void;
  onZoom: (factor: number) => void;
  onFirstInteract: () => void;
}

interface PointerState {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  time: number;
  moved: boolean;
}

const KEY_MAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right'
};

export class Controls {
  private readonly keys = new Set<string>();
  private readonly pointers = new Map<number, PointerState>();
  private pinchDistance = 0;
  private enabled = false;
  private interacted = false;
  private readonly handlers: ControlHandlers;

  constructor(
    private readonly element: HTMLElement,
    private readonly rig: CameraRig,
    handlers: ControlHandlers
  ) {
    this.handlers = handlers;
    this.bind();
  }

  private bind(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.element.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.element.addEventListener('wheel', this.onWheel, { passive: false });
    this.element.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.target instanceof HTMLElement) {
      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    }
    this.keys.add(event.code);
    if (KEY_MAP[event.code]) {
      event.preventDefault();
      this.registerInteraction();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onBlur = (): void => {
    this.keys.clear();
    this.pointers.clear();
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.enabled) return;
    this.pointers.set(event.pointerId, {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      moved: false
    });
    if (this.pointers.size === 2) {
      this.pinchDistance = this.measurePinch();
    }
        try {
          this.element.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic pointers and some embedded browsers cannot be captured.
        }
      };

  private onPointerMove = (event: PointerEvent): void => {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 8) {
      pointer.moved = true;
    }

    if (this.pointers.size === 2) {
      const distance = this.measurePinch();
      if (this.pinchDistance > 0 && distance > 0) {
        this.rig.zoomBy(this.pinchDistance / distance);
        this.registerInteraction();
      }
      this.pinchDistance = distance;
      return;
    }

    if (pointer.moved) {
      this.handlers.onRotate(dx, dy);
      this.registerInteraction();
    }
  };

  private onPointerUp = (event: PointerEvent): void => {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    this.pointers.delete(event.pointerId);

    if (this.pointers.size < 2) this.pinchDistance = 0;

    const duration = performance.now() - pointer.time;
    if (!pointer.moved && duration < 550 && event.type === 'pointerup') {
      this.handlers.onTap(event.clientX, event.clientY);
      this.registerInteraction();
    }
  };

  private onWheel = (event: WheelEvent): void => {
    if (!this.enabled) return;
    event.preventDefault();
    const factor = event.deltaY > 0 ? 1.08 : 0.92;
    this.rig.zoomBy(factor);
    this.registerInteraction();
  };

  private measurePinch(): number {
    const values = Array.from(this.pointers.values());
    if (values.length < 2) return 0;
    return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
  }

  private registerInteraction(): void {
    if (this.interacted) return;
    this.interacted = true;
    this.handlers.onFirstInteract();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.clear();
      this.pointers.clear();
    }
  }

  /** Keyboard movement in world space (-1..1 per axis). */
  getKeyboardVector(out = { x: 0, z: 0 }): { x: number; z: number } {
    out.x = 0;
    out.z = 0;
    for (const code of this.keys) {
      const action = KEY_MAP[code];
      if (action === 'left') out.x -= 1;
      if (action === 'right') out.x += 1;
      if (action === 'up') out.z -= 1;
      if (action === 'down') out.z += 1;
    }
    const length = Math.hypot(out.x, out.z);
    if (length > 1) {
      out.x /= length;
      out.z /= length;
    }
    return out;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.element.removeEventListener('wheel', this.onWheel);
  }
}