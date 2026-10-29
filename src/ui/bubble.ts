import * as THREE from 'three';
import { el } from './dom';

export type Speaker = 'bubu' | 'dudu';

interface BubbleEntry {
  root: HTMLDivElement;
  text: HTMLDivElement;
  until: number;
  anchor: THREE.Vector3;
}

export class BubbleLayer {
  readonly element = el('div', { className: 'bubble-layer', attrs: { 'aria-hidden': 'true' } });
  private readonly bubbles = new Map<Speaker, BubbleEntry>();
  private readonly projected = new THREE.Vector3();

  show(speaker: Speaker, name: string, text: string, duration = 4.2): void {
    let entry = this.bubbles.get(speaker);
    if (!entry) return;

    entry.root.querySelector('.bubble__name')!.textContent = name;
    entry.text.textContent = text;
    entry.root.classList.add('is-shown');
    entry.until = performance.now() + duration * 1000;
  }

  hide(speaker: Speaker): void {
    const entry = this.bubbles.get(speaker);
    if (!entry) return;
    entry.root.classList.remove('is-shown');
    entry.until = 0;
  }

  anchor(speaker: Speaker, position: THREE.Vector3): void {
    const entry = this.bubbles.get(speaker);
    if (!entry) {
      const text = el('div', { className: 'bubble__text' });
      const root = el(
        'div',
        { className: `bubble bubble--${speaker}` },
        [el('span', { className: 'bubble__name' }), text]
      );
      this.element.append(root);
      this.bubbles.set(speaker, {
        root,
        text,
        until: 0,
        anchor: position.clone()
      });
      return;
    }
    entry.anchor.copy(position);
  }

  update(camera: THREE.Camera): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const now = performance.now();

    for (const [speaker, entry] of this.bubbles) {
      if (entry.until && now > entry.until) {
        entry.root.classList.remove('is-shown');
        entry.until = 0;
      }
      if (!entry.until) continue;

      this.projected.copy(entry.anchor).project(camera);
      const x = (this.projected.x * 0.5 + 0.5) * width;
      const y = (-this.projected.y * 0.5 + 0.5) * height;
      const visible = this.projected.z < 1;
      entry.root.style.transform = `translate(-50%, -100%) translate3d(${Math.round(x)}px, ${Math.round(y - 16)}px, 0)`;
      entry.root.style.visibility = visible ? 'visible' : 'hidden';
      void speaker;
    }
  }
}