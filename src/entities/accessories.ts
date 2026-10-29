import * as THREE from 'three';
import { flatMaterial, makeSphere, outlined, toonMaterial } from './toon';

const COCOA = 0x4a1f1a;
const STRAW = 0xe9c07c;
const STRAW_DARK = 0xd6a45f;
const LEAF = 0x7fa36a;
const LEAF_DARK = 0x5f8450;
const PETAL = 0xf8cdd6;
const PETAL_WARM = 0xf0a9b8;
const HONEY = 0xf7d59a;

export type AccessoryId =
  | 'none'
  | 'straw'
  | 'flower-band'
  | 'scarf'
  | 'glasses'
  | 'leaf-hat'
  | 'bowtie'
  | 'flower-crown';

function disc(radius: number, color: number, height = 0.03): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.98, height, 20),
    toonMaterial(color)
  );
  mesh.castShadow = true;
  return mesh;
}

export function buildBow(color: THREE.ColorRepresentation, scale = 1): THREE.Group {
  const group = new THREE.Group();
  const lobeGeometry = new THREE.SphereGeometry(0.1 * scale, 14, 10);
  const material = toonMaterial(color);

  for (const dir of [-1, 1]) {
    const lobe = new THREE.Mesh(lobeGeometry, material);
    lobe.position.set(dir * 0.085 * scale, 0, 0);
    lobe.scale.set(1.35, 0.85, 0.62);
    lobe.rotation.z = dir * 0.22;
    lobe.castShadow = true;
    outlined(lobe, 1.09);
    group.add(lobe);
  }

  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.052 * scale, 12, 9), toonMaterial(color));
  knot.scale.set(1, 1.1, 0.9);
  knot.castShadow = true;
  outlined(knot, 1.1);
  group.add(knot);

  for (const dir of [-1, 1]) {
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.058 * scale, 10, 8), material);
    tail.scale.set(0.7, 1.25, 0.45);
    tail.position.set(dir * 0.045 * scale, -0.105 * scale, 0);
    tail.rotation.z = dir * 0.28;
    outlined(tail, 1.08);
    group.add(tail);
  }

  return group;
}

export function buildStrawHat(): THREE.Group {
  const group = new THREE.Group();

  const brim = disc(0.34, STRAW, 0.035);
  outlined(brim, 1.05);
  group.add(brim);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.26, 0.2, 18, 1, false),
    toonMaterial(STRAW)
  );
  crown.position.y = 0.11;
  crown.castShadow = true;
  outlined(crown, 1.05);
  group.add(crown);

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.263, 0.263, 0.06, 18, 1, true),
    toonMaterial(STRAW_DARK)
  );
  band.position.y = 0.035;
  group.add(band);

  const bow = buildBow(PETAL_WARM, 0.72);
  bow.position.set(0.24, 0.055, 0.03);
  bow.rotation.z = -0.3;
  group.add(bow);

  return group;
}

export function buildFlowerBand(): THREE.Group {
  const group = new THREE.Group();
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.47, 0.026, 8, 26, Math.PI * 1.1),
    toonMaterial(STRAW_DARK)
  );
  band.rotation.y = Math.PI / 2;
  band.rotation.z = Math.PI * 0.45;
  band.position.y = 0.06;
  group.add(band);

  const petalGeometry = new THREE.SphereGeometry(0.055, 10, 8);
  const positions: Array<[number, number, number, number]> = [
    [0.28, 0.16, 0.4, PETAL],
    [-0.26, 0.17, 0.4, PETAL_WARM],
    [0.4, 0.12, 0.16, PETAL_WARM],
    [-0.42, 0.1, -0.06, PETAL]
  ];
  for (const [x, y, z, color] of positions) {
    const flower = new THREE.Group();
    for (let i = 0; i < 5; i += 1) {
      const petal = new THREE.Mesh(petalGeometry, toonMaterial(color));
      const angle = (i / 5) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.05, Math.sin(angle) * 0.05, 0);
      petal.scale.set(1, 1, 0.55);
      flower.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), toonMaterial(HONEY));
    center.position.z = 0.03;
    flower.add(center);
    flower.position.set(x, y, z);
    flower.lookAt(x * 2, y * 2, z * 2.4);
    group.add(flower);
  }
  return group;
}

export function buildScarf(color: THREE.ColorRepresentation): THREE.Group {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.075, 10, 22),
    toonMaterial(color)
  );
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = true;
  outlined(ring, 1.05);
  group.add(ring);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.06), toonMaterial(color));
  tail.position.set(0.19, -0.19, 0.24);
  tail.rotation.z = -0.18;
  tail.castShadow = true;
  outlined(tail, 1.05);
  group.add(tail);

  return group;
}

export function buildGlasses(): THREE.Group {
  const group = new THREE.Group();
  const material = flatMaterial(COCOA);
  for (const x of [-0.15, 0.15]) {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.017, 6, 18), material);
    lens.position.set(x, 0, 0);
    group.add(lens);
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(0.1, 18),
      new THREE.MeshBasicMaterial({ color: 0xdff0ff, transparent: true, opacity: 0.22 })
    );
    glass.position.set(x, 0, -0.002);
    group.add(glass);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.016, 0.016), material);
  group.add(bridge);
  for (const dir of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.014), material);
    arm.position.set(dir * 0.32, 0.01, -0.03);
    arm.rotation.y = dir * -0.5;
    group.add(arm);
  }
  return group;
}

export function buildLeafHat(): THREE.Group {
  const group = new THREE.Group();

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.26, 14, 1, true), toonMaterial(LEAF));
  cap.position.y = 0.13;
  cap.castShadow = true;
  cap.material.side = THREE.DoubleSide;
  outlined(cap, 1.06);
  group.add(cap);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 0.14, 6), toonMaterial(LEAF_DARK));
  stem.position.set(0.05, 0.3, 0);
  stem.rotation.z = -0.35;
  group.add(stem);

  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), toonMaterial(LEAF_DARK));
  leaf.scale.set(1.5, 0.36, 0.8);
  leaf.position.set(-0.13, 0.34, 0);
  leaf.rotation.z = 0.5;
  group.add(leaf);

  return group;
}

export function buildFlowerCrown(): THREE.Group {
  const group = new THREE.Group();
  const petalGeometry = new THREE.SphereGeometry(0.05, 9, 7);

  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const flower = new THREE.Group();
    const color = i % 2 === 0 ? PETAL : PETAL_WARM;
    for (let p = 0; p < 5; p += 1) {
      const pa = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeometry, toonMaterial(color));
      petal.position.set(Math.cos(pa) * 0.046, Math.sin(pa) * 0.046, 0);
      petal.scale.set(1, 1, 0.6);
      flower.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), toonMaterial(HONEY));
    center.position.z = 0.028;
    flower.add(center);
    flower.position.set(Math.cos(angle) * 0.44, 0.12 + Math.sin(angle) * 0.04, Math.sin(angle) * 0.44);
    flower.lookAt(Math.cos(angle) * 2, 0.3, Math.sin(angle) * 2);
    group.add(flower);
  }

  return group;
}

export function buildAccessory(id: AccessoryId, ribbonColor: THREE.ColorRepresentation): THREE.Group | null {
  switch (id) {
    case 'straw':
      return buildStrawHat();
    case 'flower-band':
      return buildFlowerBand();
    case 'scarf':
      return buildScarf(PETAL);
    case 'glasses':
      return buildGlasses();
    case 'leaf-hat':
      return buildLeafHat();
    case 'bowtie':
      return buildBow(0xcf7189, 1.15);
    case 'flower-crown':
      return buildFlowerCrown();
    case 'none':
    default:
      if (ribbonColor) return null;
      return null;
  }
}

/** Straw hat boss: a tiny sunhat for a very small bear. Kept separate for reuse. */
export function buildMiniHat(color: THREE.ColorRepresentation = HONEY): THREE.Group {
  const group = new THREE.Group();
  const base = makeSphere(0.13, color, 12, 1.08);
  base.scale.y = 0.7;
  group.add(base);
  return group;
}