import * as THREE from 'three';
import { cropById, type CropKind, type CropShape } from '../data/crops';
import { isReady, needsWater, progressOf } from '../systems/farming';
import type { PlotState } from '../save/save';
import { outlined, toonMaterial } from '../entities/toon';

const TILE_SIZE = 0.86;
const SPACING = 1.06;
const READY_COLOR = 0xfff0b8;

interface PlotVisual {
  root: THREE.Group;
  tile: THREE.Mesh;
  crop: THREE.Group | null;
  marker: THREE.Mesh;
  dryPatch: THREE.Mesh;
  stage: number;
  sway: number;
}

export class FarmGrid {
  readonly group = new THREE.Group();
  readonly tiles: THREE.Mesh[] = [];
  private readonly plots: PlotVisual[] = [];
  private readonly columns = 3;

  constructor(center: THREE.Vector3, rotation = 0) {
    this.group.position.copy(center);
    this.group.rotation.y = rotation;

    for (let i = 0; i < 9; i += 1) {
      const col = i % this.columns;
      const row = Math.floor(i / this.columns);
      const x = (col - 1) * SPACING;
      const z = (row - 1) * SPACING;
      this.plots.push(this.buildPlot(i, x, z));
    }
  }

  private buildPlot(index: number, x: number, z: number): PlotVisual {
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    this.group.add(root);

    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(TILE_SIZE, 0.12, TILE_SIZE),
      toonMaterial(0xb98d6d)
    );
    tile.position.y = 0.06;
    tile.receiveShadow = true;
    tile.userData.plotIndex = index;
    outlined(tile, 1.02);
    root.add(tile);
    this.tiles.push(tile);

    const dryPatch = new THREE.Mesh(
      new THREE.CircleGeometry(TILE_SIZE * 0.34, 12),
      new THREE.MeshBasicMaterial({ color: 0xd9b694, transparent: true, opacity: 0.0 })
    );
    dryPatch.rotation.x = -Math.PI / 2;
    dryPatch.position.y = 0.125;
    root.add(dryPatch);

    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.025, 6, 16),
      new THREE.MeshBasicMaterial({ color: READY_COLOR, transparent: true, opacity: 0 })
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.72;
    root.add(marker);

    return { root, tile, crop: null, marker, dryPatch, stage: 0, sway: Math.random() * Math.PI * 2 };
  }

  /** Rebuilds a plot's crop only when its visual stage actually changes. */
  sync(states: PlotState[], now: number): void {
    for (let i = 0; i < this.plots.length; i += 1) {
      const visual = this.plots[i];
      const state = states[i];
      if (!state) continue;

      const crop = cropById(state.cropId);
      const ready = isReady(state);
      const stage = crop ? (ready ? crop.stages : Math.max(1, Math.ceil(progressOf(state) * crop.stages))) : 0;

      if (stage !== visual.stage) {
        visual.stage = stage;
        if (visual.crop) {
          visual.root.remove(visual.crop);
          disposeGroup(visual.crop);
          visual.crop = null;
        }
        if (crop && stage > 0) {
          visual.crop = buildCropVisual(crop.id, stage, crop.stages);
          visual.root.add(visual.crop);
        }
      }

      (visual.marker.material as THREE.MeshBasicMaterial).opacity = ready ? 0.75 : 0;
            visual.marker.position.y = crop ? 0.86 : 0.3;
            visual.marker.scale.setScalar(ready ? 1 + Math.sin(now / 320) * 0.08 : 0.001);
            (visual.dryPatch.material as THREE.MeshBasicMaterial).opacity = needsWater(state, now) ? 0.55 : 0;

            const tileMaterial = visual.tile.material as THREE.MeshToonMaterial;
      tileMaterial.color.setHex(needsWater(state, now) ? 0xa87f61 : 0xb98d6d);
    }
  }

  animate(time: number): void {
    this.plots.forEach((visual, index) => {
      if (!visual.crop) return;
      visual.crop.rotation.z = Math.sin(time * 1.4 + visual.sway + index) * 0.045;
      visual.crop.rotation.x = Math.cos(time * 1.1 + visual.sway) * 0.03;
    });
  }

  getIndexFromObject(object: THREE.Object3D): number | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      if (typeof node.userData.plotIndex === 'number') return node.userData.plotIndex as number;
      node = node.parent;
    }
    return null;
  }
}

export function buildCropVisual(cropId: string, stage: number, stages: number): THREE.Group {
  const crop = cropById(cropId);
  const group = new THREE.Group();
  if (!crop) return group;

  const heightRatio = Math.min(1, stage / stages);
  const stemHeight = 0.18 + heightRatio * 0.46;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.026, stemHeight, 5),
    toonMaterial(crop.leafColor)
  );
  stem.position.y = stemHeight / 2;
  stem.castShadow = true;
  group.add(stem);

  const leafCount = stage >= 2 ? 4 : 2;
  for (let i = 0; i < leafCount; i += 1) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6),
      toonMaterial(crop.leafColor)
    );
    const angle = (i / leafCount) * Math.PI * 2 + 0.4;
    const y = 0.1 + (i % 2) * 0.12;
    leaf.position.set(Math.cos(angle) * 0.11, y, Math.sin(angle) * 0.11);
    leaf.scale.set(1.5, 0.42, 0.8);
    leaf.rotation.y = angle;
    leaf.rotation.z = 0.28;
    group.add(leaf);
  }

  if (stage < stages) {
    if (stage >= 2) {
      const bud = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 8),
        toonMaterial(crop.leafColor)
      );
      bud.scale.set(1, 1.15, 1);
      bud.position.y = stemHeight + 0.03;
      group.add(bud);
    }
    return group;
  }

  const shape = crop.shape ?? defaultShape(crop.kind);
    group.add(buildRipe(shape, crop.bloomColor, crop.leafColor, stemHeight));

    return group;
  }

  function defaultShape(kind: CropKind): CropShape {
    if (kind === 'flower') return 'bloom';
    if (kind === 'fruit') return 'berry';
    return 'carrot';
  }

  function buildRipe(shape: CropShape, color: number, leaf: number, topY: number): THREE.Group {
    const g = new THREE.Group();
    g.position.y = topY;

    switch (shape) {
      case 'bloom': {
        const petalGeometry = new THREE.SphereGeometry(0.062, 9, 7);
        for (let i = 0; i < 6; i += 1) {
          const angle = (i / 6) * Math.PI * 2;
          const petal = new THREE.Mesh(petalGeometry, toonMaterial(color));
          petal.position.set(Math.cos(angle) * 0.06, Math.sin(angle) * 0.06, 0);
          petal.scale.set(1, 1, 0.6);
          g.add(petal);
        }
        const center = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), toonMaterial(0xf7d59a));
        center.position.z = 0.03;
        g.add(center);
        g.rotation.x = -Math.PI / 2.4;
        break;
      }
      case 'tulip': {
        const cup = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), toonMaterial(color));
        cup.scale.set(1, 1.25, 1);
        cup.position.y = 0.03;
        g.add(cup);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 8), toonMaterial(color));
        tip.position.set(0, 0.16, 0.02);
        g.add(tip);
        break;
      }
      case 'spike': {
        for (let i = 0; i < 4; i += 1) {
          const bud = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), toonMaterial(color));
          bud.position.y = i * 0.06;
          bud.scale.set(1, 1.2, 1);
          g.add(bud);
        }
        break;
      }
      case 'puff': {
        for (const [x, y, z] of [
          [-0.05, 0, 0],
          [0.05, 0, 0],
          [0, 0, -0.05],
          [0, 0, 0.05],
          [0, 0.055, 0]
        ] as const) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), toonMaterial(color));
          puff.position.set(x, y, z);
          g.add(puff);
        }
        break;
      }
      case 'berry': {
        for (let i = 0; i < 3; i += 1) {
          const berry = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), toonMaterial(color));
          const angle = (i / 3) * Math.PI * 2;
          berry.position.set(Math.cos(angle) * 0.08, 0.06 + i * 0.02, Math.sin(angle) * 0.08);
          berry.scale.set(1, 1.15, 1);
          g.add(berry);
        }
        break;
      }
      case 'melon': {
        const melon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), toonMaterial(color));
        melon.scale.set(1, 1.05, 1.1);
        melon.position.y = -0.04;
        g.add(melon);
        break;
      }
      case 'apple': {
        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), toonMaterial(color));
        apple.position.y = 0.01;
        g.add(apple);
        const stemTip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 5), toonMaterial(leaf));
        stemTip.position.y = 0.12;
        g.add(stemTip);
        break;
      }
      case 'grapes': {
        for (let row = 0; row < 3; row += 1) {
          const n = 3 - row;
          for (let i = 0; i < n; i += 1) {
            const grape = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), toonMaterial(color));
            grape.position.set((i - (n - 1) / 2) * 0.1, -row * 0.08, 0);
            g.add(grape);
          }
        }
        break;
      }
      case 'peach': {
        const peach = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), toonMaterial(color));
        peach.scale.set(1, 1.1, 0.95);
        peach.position.y = 0.01;
        g.add(peach);
        const crease = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 0.16, 6), toonMaterial(0xf2c1b0));
        crease.position.y = 0.02;
        g.add(crease);
        break;
      }
      case 'carrot': {
        const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 8), toonMaterial(color));
        carrot.position.y = -0.1;
        carrot.rotation.x = Math.PI;
        g.add(carrot);
        for (let i = 0; i < 3; i += 1) {
          const top = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 5), toonMaterial(leaf));
          const angle = (i / 3) * Math.PI * 2;
          top.position.set(Math.cos(angle) * 0.05, 0.06, Math.sin(angle) * 0.05);
          top.rotation.z = Math.cos(angle) * 0.4;
          top.rotation.x = Math.sin(angle) * 0.4;
          g.add(top);
        }
        break;
      }
      case 'tomato': {
        for (let i = 0; i < 3; i += 1) {
          const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), toonMaterial(color));
          const angle = (i / 3) * Math.PI * 2;
          tomato.position.set(Math.cos(angle) * 0.07, 0.02 + i * 0.03, Math.sin(angle) * 0.07);
          g.add(tomato);
        }
        break;
      }
      case 'cob': {
        const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.22, 8), toonMaterial(color));
        cob.position.y = 0;
        g.add(cob);
        for (let i = 0; i < 3; i += 1) {
          const husk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 5), toonMaterial(leaf));
          const angle = (i / 3) * Math.PI * 2;
          husk.position.set(Math.cos(angle) * 0.1, -0.05, Math.sin(angle) * 0.1);
          husk.rotation.z = Math.cos(angle) * 0.7;
          g.add(husk);
        }
        break;
      }
      case 'eggplant': {
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), toonMaterial(color));
        fruit.scale.set(1, 1.4, 1);
        fruit.position.y = -0.04;
        g.add(fruit);
        const calyx = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), toonMaterial(leaf));
        calyx.position.y = 0.1;
        g.add(calyx);
        break;
      }
      case 'leafy': {
        for (let i = 0; i < 5; i += 1) {
          const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), toonMaterial(color));
          const angle = (i / 5) * Math.PI * 2;
          leafMesh.position.set(Math.cos(angle) * 0.08, 0.02, Math.sin(angle) * 0.08);
          leafMesh.scale.set(1.6, 0.5, 0.7);
          leafMesh.rotation.y = angle;
          leafMesh.rotation.z = 0.6;
          g.add(leafMesh);
        }
        break;
      }
    }

    return g;
  }

function disposeGroup(group: THREE.Object3D): void {
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
    else material.dispose();
  });
}