import * as THREE from 'three';
import { MEMORIES } from '../data/memories';
import { outlined, toonMaterial } from '../entities/toon';

const WOOD = 0xc08c5c;
const WOOD_DARK = 0x8e5f3d;
const METAL = 0xf0c67c;
const GLOW = 0xffe6a8;

interface ChestVisual {
  id: string;
  root: THREE.Group;
  lid: THREE.Group;
  heart: THREE.Mesh;
  halo: THREE.Mesh;
  opened: boolean;
  openProgress: number;
  phase: number;
}

export class MemoryChests {
  readonly group = new THREE.Group();
  readonly meshes: THREE.Object3D[] = [];
  private readonly chests: ChestVisual[] = [];

  constructor(parent: THREE.Object3D) {
    parent.add(this.group);

    for (const memory of MEMORIES) {
      const visual = this.build(memory.id, memory.index);
      visual.root.position.set(memory.position.x, 0, memory.position.z);
      visual.root.rotation.y = Math.atan2(-memory.position.x, -memory.position.z) * 0.4;
      this.group.add(visual.root);
      this.chests.push(visual);
      this.meshes.push(visual.root);
    }
  }

  private build(id: string, index: number): ChestVisual {
    const root = new THREE.Group();
    root.userData.memoryId = id;

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.46), toonMaterial(WOOD));
    body.position.y = 0.2;
    body.castShadow = true;
    body.userData.memoryId = id;
    outlined(body, 1.04);
    root.add(body);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.07, 0.52), toonMaterial(WOOD_DARK));
    base.position.y = 0.035;
    base.userData.memoryId = id;
    outlined(base, 1.04);
    root.add(base);

    for (const x of [-0.22, 0.22]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.36, 0.48), toonMaterial(METAL));
      band.position.set(x, 0.2, 0);
      band.userData.memoryId = id;
      root.add(band);
    }

    const lid = new THREE.Group();
    lid.position.set(0, 0.37, -0.23);
    root.add(lid);

    const lidShell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.62, 14, 1, false, 0, Math.PI),
      toonMaterial(WOOD)
    );
    lidShell.rotation.z = Math.PI / 2;
    lidShell.rotation.y = Math.PI / 2;
    lidShell.position.set(0, 0, 0.23);
    lidShell.castShadow = true;
    lidShell.userData.memoryId = id;
    outlined(lidShell, 1.04);
    lid.add(lidShell);

    const lidTrim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.06), toonMaterial(METAL));
    lidTrim.position.set(0, 0.02, 0.44);
    lid.add(lidTrim);

    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.13, 0.05), toonMaterial(METAL));
    lock.position.set(0, 0.26, 0.245);
    lock.userData.memoryId = id;
    root.add(lock);

    const label = new THREE.Mesh(
      new THREE.CircleGeometry(0.09, 14),
      new THREE.MeshBasicMaterial({ color: 0xfff1da })
    );
    label.position.set(0, 0.3, 0.247);
    root.add(label);

    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xea8fa6, transparent: true, opacity: 0.9 })
    );
    heart.position.y = 0.82;
    heart.scale.set(1, 0.9, 0.7);
    root.add(heart);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.012, 5, 22),
      new THREE.MeshBasicMaterial({ color: GLOW, transparent: true, opacity: 0.6 })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.54;
    root.add(halo);

    const marker = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 18),
      new THREE.MeshBasicMaterial({ color: GLOW, transparent: true, opacity: 0.16, depthWrite: false })
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.015;
    root.add(marker);

    void index;

    return {
      id,
      root,
      lid,
      heart,
      halo,
      opened: false,
      openProgress: 0,
      phase: Math.random() * Math.PI * 2
    };
  }

  sync(collected: string[]): void {
    for (const chest of this.chests) {
      const opened = collected.includes(chest.id);
      if (opened !== chest.opened) {
        chest.opened = opened;
        chest.openProgress = opened ? 1 : 0;
      }
    }
  }

  animate(dt: number, time: number): void {
    for (const chest of this.chests) {
      const target = chest.opened ? 1 : 0;
      chest.openProgress = THREE.MathUtils.damp(chest.openProgress, target, 4.5, dt);
      chest.lid.rotation.x = -1.15 * easeOut(chest.openProgress);

      const glow = 1 - chest.openProgress;
      chest.heart.visible = glow > 0.05;
            (chest.heart.material as THREE.MeshBasicMaterial).opacity = glow;
      chest.heart.position.y = 0.82 + Math.sin(time * 2 + chest.phase) * 0.05;
      chest.heart.rotation.y = time * 1.2;
      chest.halo.visible = glow > 0.05;
            (chest.halo.material as THREE.MeshBasicMaterial).opacity = glow * 0.55;
      chest.halo.scale.setScalar(1 + Math.sin(time * 2.4 + chest.phase) * 0.08);
      chest.root.position.y = chest.opened ? 0 : Math.sin(time * 1.4 + chest.phase) * 0.012;
    }
  }

  getIdFromObject(object: THREE.Object3D): string | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      const id = node.userData.memoryId;
      if (typeof id === 'string') return id;
      node = node.parent;
    }
    return null;
  }

  getClosedChestWorldPosition(): THREE.Vector3 | null {
    const closed = this.chests.find((chest) => !chest.opened);
    if (!closed) return null;
    return closed.root.getWorldPosition(new THREE.Vector3()).setY(0.9);
  }

  nearestOpenable(position: THREE.Vector3): { id: string; distance: number } | null {
    let best: { id: string; distance: number } | null = null;
    for (const chest of this.chests) {
      if (chest.opened) continue;
      const distance = Math.hypot(
        chest.root.position.x - position.x,
        chest.root.position.z - position.z
      );
      if (!best || distance < best.distance) best = { id: chest.id, distance };
    }
    return best;
  }

  getOpenedCount(): number {
    return this.chests.filter((chest) => chest.opened).length;
  }

  /** World position of a chest, for the camera or a particle burst. */
  positionOf(id: string): THREE.Vector3 | null {
    const chest = this.chests.find((entry) => entry.id === id);
    if (!chest) return null;
    return chest.root.position.clone().setY(0.75);
  }
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}