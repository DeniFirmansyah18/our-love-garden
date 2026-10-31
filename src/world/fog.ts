import * as THREE from 'three';
import { ZONES, type ZoneId } from '../data/zones';

interface FogEntry {
  zone: ZoneId;
  group: THREE.Group;
  disc: THREE.Mesh;
  puffs: THREE.Mesh[];
  opacity: number;
  target: number;
}

/**
 * Pastel mist that hides each undiscovered district. One disc plus a handful of
 * low puffs per zone, so it costs almost nothing to draw and never turns the
 * world into a dark rectangle.
 */
export class FogOfWar {
  readonly group = new THREE.Group();
  private readonly entries = new Map<ZoneId, FogEntry>();
  private readonly textures = new Map<number, THREE.Texture>();

  constructor(scene: THREE.Scene, visited: string[]) {
    scene.add(this.group);

    for (const zone of ZONES) {
      if (zone.unlock === 'start' && visited.includes(zone.id)) continue;

      const entry = this.buildEntry(zone.id, zone.center.x, zone.center.z, zone.radius, zone.fogColor);
      const revealed = visited.includes(zone.id);
      entry.opacity = revealed ? 0 : 1;
      entry.target = entry.opacity;
      entry.group.visible = !revealed;
      entry.group.position.set(zone.center.x, 0, zone.center.z);
      this.group.add(entry.group);
      this.entries.set(zone.id, entry);
    }
  }

  private buildEntry(
    zone: ZoneId,
    x: number,
    z: number,
    radius: number,
    color: number
  ): FogEntry {
    void x;
    void z;
    const group = new THREE.Group();

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 1.18, 40),
      new THREE.MeshBasicMaterial({
        map: this.textureFor(color),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.07;
    disc.renderOrder = 6;
    group.add(disc);

    const puffMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.2,
      depthWrite: false
    });
    const puffGeometry = new THREE.SphereGeometry(1, 10, 8);
    const puffs: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i += 1) {
      const angle = (i / 7) * Math.PI * 2 + 0.3;
      const puff = new THREE.Mesh(puffGeometry, puffMaterial);
      const distance = radius * (0.55 + (i % 3) * 0.16);
      puff.position.set(Math.cos(angle) * distance, 0.55 + (i % 2) * 0.35, Math.sin(angle) * distance);
      puff.scale.set(radius * 0.34, radius * 0.17, radius * 0.34);
      puff.renderOrder = 6;
      group.add(puff);
      puffs.push(puff);
    }

    return { zone, group, disc, puffs, opacity: 1, target: 1 };
  }

  private textureFor(color: number): THREE.Texture {
    const cached = this.textures.get(color);
    if (cached) return cached;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const hex = `#${color.toString(16).padStart(6, '0')}`;
      const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.5);
      gradient.addColorStop(0, hex);
      gradient.addColorStop(0.55, hex);
      gradient.addColorStop(0.82, `${hex}cc`);
      gradient.addColorStop(1, `${hex}00`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.set(color, texture);
    return texture;
  }

  reveal(zone: ZoneId, instant = false): void {
    const entry = this.entries.get(zone);
    if (!entry) return;
    entry.target = 0;
    if (instant) {
      entry.opacity = 0;
      entry.group.visible = false;
    }
  }

    /** Re-applies fog after a save reset. */
    reset(visited: string[]): void {
      for (const entry of this.entries.values()) {
        const revealed = visited.includes(entry.zone);
        entry.target = revealed ? 0 : 1;
        entry.opacity = revealed ? 0 : 1;
        entry.group.visible = !revealed;
      }
    }

  isVisible(zone: ZoneId): boolean {
    const entry = this.entries.get(zone);
    if (!entry) return false;
    return entry.group.visible;
  }

  update(dt: number, time: number): void {
    for (const entry of this.entries.values()) {
      if (!entry.group.visible) continue;
      entry.opacity = THREE.MathUtils.damp(entry.opacity, entry.target, 3.4, dt);
      const material = entry.disc.material as THREE.MeshBasicMaterial;
      material.opacity = entry.opacity * 0.92;
      entry.puffs.forEach((puff, index) => {
        const puffMaterial = puff.material as THREE.MeshBasicMaterial;
        puffMaterial.opacity = entry.opacity * 0.2;
        puff.position.y = 0.55 + (index % 2) * 0.35 + Math.sin(time * 0.6 + index) * 0.12;
      });
      if (entry.opacity < 0.02 && entry.target === 0) {
        entry.group.visible = false;
      }
    }
  }

  dispose(): void {
    this.textures.forEach((texture) => texture.dispose());
    this.textures.clear();
    this.entries.clear();
  }
}