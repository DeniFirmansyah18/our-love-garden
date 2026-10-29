import * as THREE from 'three';

const LANTERN_COUNT = 22;

interface Lantern {
  group: THREE.Group;
  body: THREE.Mesh;
  glow: THREE.Mesh;
  speed: number;
  sway: number;
  phase: number;
  baseX: number;
  baseZ: number;
}

/**
 * Paper lanterns released at the finale. Cheap meshes with additive glow,
 * rising and fading out before wrapping back down.
 */
export class LanternShow {
  readonly group = new THREE.Group();
  private readonly lanterns: Lantern[] = [];
  private active = false;

  constructor(scene: THREE.Scene) {
    const bodyGeometry = new THREE.SphereGeometry(0.26, 10, 8);
    const glowGeometry = new THREE.SphereGeometry(0.46, 10, 8);

    for (let i = 0; i < LANTERN_COUNT; i += 1) {
      const angle = (i / LANTERN_COUNT) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 2.5 + Math.random() * 7.5;

      const group = new THREE.Group();
      const body = new THREE.Mesh(
        bodyGeometry,
        new THREE.MeshBasicMaterial({ color: 0xffe0a3, transparent: true, opacity: 0.92 })
      );
      body.scale.set(1, 1.35, 1);
      group.add(body);

      const glow = new THREE.Mesh(
        glowGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xffc879,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      group.add(glow);

      group.position.set(Math.cos(angle) * radius, 1 + Math.random() * 6, Math.sin(angle) * radius);
      group.visible = false;
      this.group.add(group);

      this.lanterns.push({
        group,
        body,
        glow,
        speed: 0.22 + Math.random() * 0.3,
        sway: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius
      });
    }

    scene.add(this.group);
    this.group.visible = false;
  }

  start(): void {
    this.active = true;
    this.group.visible = true;
    for (const lantern of this.lanterns) lantern.group.visible = true;
  }

  stop(): void {
    this.active = false;
    this.group.visible = false;
  }

  isActive(): boolean {
    return this.active;
  }

  update(dt: number, time: number): void {
    if (!this.active) return;
    for (const lantern of this.lanterns) {
      const position = lantern.group.position;
      position.y += lantern.speed * dt;
      if (position.y > 15) {
        position.y = 0.6;
        lantern.phase = Math.random() * Math.PI * 2;
      }
      position.x = lantern.baseX + Math.sin(time * 0.6 + lantern.phase) * lantern.sway;
      position.z = lantern.baseZ + Math.cos(time * 0.5 + lantern.phase) * lantern.sway;

      const fade =
        Math.min(1, position.y * 0.6) * Math.min(1, Math.max(0, (15 - position.y) * 0.5));
      (lantern.body.material as THREE.MeshBasicMaterial).opacity = 0.92 * fade;
      (lantern.glow.material as THREE.MeshBasicMaterial).opacity = 0.18 * fade;
      lantern.group.rotation.y = time * 0.2 + lantern.phase;
    }
  }
}

/** Handy spread of sky positions for fireworks bursts. */
export function fireworkPositions(): THREE.Vector3[] {
  return Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * 5, 5.2 + (index % 3) * 1.2, Math.sin(angle) * 5);
  });
}