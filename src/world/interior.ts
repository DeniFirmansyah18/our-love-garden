import * as THREE from 'three';
import { outlined, sphereGeometry, toonMaterial } from '../entities/toon';

const WOOD = 0xc09068;
const WOOD_DARK = 0x9a6d4c;
const CREAM = 0xfff1da;
const ROSE = 0xe08d9e;
const LEAF = 0x86ab74;
const LAMP_GLOW = 0xffd79a;
const STONE = 0xd8cfc0;

export interface InteriorProp {
  group: THREE.Group;
  update?: (time: number) => void;
  /** Set when the prop owns a light that should follow the day/night cycle. */
  setNight?: (amount: number) => void;
}

export interface PhotoFrameOptions {
  /** File name inside /public/photos, or null for the painted polaroid. */
  photo: string | null;
}

export interface AquariumOptions {
  /** Body colour of the fish living inside, or null for an empty bowl. */
  fishColor: number | null;
  finColor?: number;
}

/** Procedural polaroid used when a photo file is missing, so nothing looks broken. */
function polaroidTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffe9ef';
    ctx.fillRect(0, 0, 256, 192);
    ctx.fillStyle = '#e2666f';
    // A chunky drawn heart keeps the house frame warm even without a photo.
    ctx.beginPath();
    ctx.moveTo(128, 118);
    ctx.bezierCurveTo(88, 86, 58, 106, 128, 152);
    ctx.bezierCurveTo(198, 106, 168, 86, 128, 118);
    ctx.fill();
    ctx.strokeStyle = 'rgba(122, 68, 54, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A standing frame that shows the couple's photo. Loads from /public/photos and
 * falls back to a painted polaroid when the file has not been added yet.
 */
export function buildPhotoFrame(
  position: { x: number; z: number },
  rotation = 0,
  options: PhotoFrameOptions = { photo: null }
): InteriorProp {
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotation;

  const legs = new THREE.Group();
  for (const x of [-0.4, 0.4]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, 1.05, 6),
      toonMaterial(WOOD_DARK)
    );
    leg.position.set(x, 0.52, -0.1);
    leg.rotation.z = x > 0 ? -0.12 : 0.12;
    leg.castShadow = true;
    outlined(leg, 1.06);
    legs.add(leg);
  }
  group.add(legs);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.82, 0.06), toonMaterial(WOOD));
  back.position.y = 1.25;
  back.castShadow = true;
  outlined(back, 1.02);
  group.add(back);

  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(0.94, 0.68),
    new THREE.MeshBasicMaterial({ map: polaroidTexture() })
  );
  mat.position.set(0, 1.25, 0.035);
  group.add(mat);

  // Try the chosen photo; when it loads it replaces the painted fallback.
  if (options.photo) {
    const loader = new THREE.TextureLoader();
    const file = options.photo;
    loader.load(
      `${import.meta.env.BASE_URL}photos/${file}`,
      (photoTexture) => {
        photoTexture.colorSpace = THREE.SRGBColorSpace;
        (mat.material as THREE.MeshBasicMaterial).map = photoTexture;
        (mat.material as THREE.MeshBasicMaterial).needsUpdate = true;
      },
      undefined,
      () => {
        // Keep the painted polaroid on error.
      }
    );
  }

  for (const x of [-0.5, 0.5]) {
    const riser = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.7), toonMaterial(WOOD_DARK));
    riser.position.set(x, 1.05, 0);
    outlined(riser, 1.05);
    group.add(riser);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.86, 0.24), toonMaterial(WOOD));
    top.position.set(x, 1.62, 0);
    outlined(top, 1.04);
    group.add(top);
  }

  return { group };
}

/** A little home aquarium for the house corner; a fish swims in a slow loop. */
export function buildAquarium(
  position: { x: number; z: number },
  options: AquariumOptions = { fishColor: 0xf0a9b8, finColor: 0xe2666f }
): InteriorProp {
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.42, 0.88, 10),
    toonMaterial(WOOD_DARK)
  );
  table.position.y = 0.44;
  table.castShadow = true;
  outlined(table, 1.03);
  group.add(table);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.27, 0.34, 16),
    new THREE.MeshToonMaterial({ color: 0x9fd3d0, transparent: true, opacity: 0.75 })
  );
  water.position.y = 1.06;
  group.add(water);

  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshBasicMaterial({
      color: 0xdcf1f4,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  glass.rotation.x = Math.PI;
  glass.position.y = 1.24;
  group.add(glass);

  const hasFish = options.fishColor !== null;
  const fish = new THREE.Group();
  const body = new THREE.Mesh(sphereGeometry(0.05, 8), toonMaterial(options.fishColor ?? 0xf0a9b8));
  body.scale.set(1.6, 0.9, 0.75);
  outlined(body, 1.08);
  fish.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.07, 4), toonMaterial(options.finColor ?? 0xe2666f));
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -0.08;
  fish.add(tail);
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0x3b1a15 })
  );
  eye.position.set(0.05, 0.008, 0.03);
  fish.add(eye);
  fish.position.set(0, 1.08, 0.12);
  fish.visible = hasFish;
  group.add(fish);

  const bubble = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
  );
  bubble.position.set(0.06, 1.14, 0.16);
  bubble.visible = hasFish;
  group.add(bubble);

  if (!hasFish) return { group };

  return {
    group,
    update: (time) => {
      const angle = time * 0.8;
      fish.position.x = Math.cos(angle) * 0.14;
      fish.position.z = Math.sin(angle) * 0.14;
      fish.rotation.y = -angle + Math.PI / 2;
      fish.rotation.z = Math.sin(time * 4) * 0.1;
      bubble.position.y = 1.14 + ((time * 0.25) % 0.12);
    }
  };
}

/** Two terracotta flower pots freshening up the front yard. */
export function buildFlowerPots(position: { x: number; z: number }): InteriorProp {
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);

  for (const x of [-0.5, 0.5]) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 0.34, 9),
      toonMaterial(0xd98a6a)
    );
    pot.position.set(x, 0.17, 0);
    pot.castShadow = true;
    outlined(pot, 1.05);
    group.add(pot);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.04, 9),
      toonMaterial(0x8a5a3b)
    );
    soil.position.set(x, 0.34, 0);
    group.add(soil);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.34, 5), toonMaterial(LEAF));
    stem.position.set(x, 0.52, 0);
    group.add(stem);

    const bloom = new THREE.Mesh(sphereGeometry(0.09, 9), toonMaterial(x < 0 ? ROSE : 0xf2c14e));
    bloom.position.set(x, 0.72, 0);
    bloom.castShadow = true;
    outlined(bloom, 1.07);
    group.add(bloom);
  }

  return { group };
}

/** A little display shelf for the couple's harvests and little treasures. */
export function buildHarvestShelf(position: { x: number; z: number }, rotation = 0): InteriorProp {
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotation;

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.12), toonMaterial(WOOD_DARK));
  frame.position.y = 0.55;
  frame.castShadow = true;
  outlined(frame, 1.03);
  group.add(frame);

  for (const y of [0.34, 0.74]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.06, 0.22), toonMaterial(WOOD));
    shelf.position.set(0, y, 0.08);
    shelf.castShadow = true;
    outlined(shelf, 1.05);
    group.add(shelf);
  }

  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.28, 8), toonMaterial(0xf4dfc0));
  jar.position.set(-0.4, 0.48, 0.18);
  outlined(jar, 1.06);
  group.add(jar);

  const apple = new THREE.Mesh(sphereGeometry(0.09, 8), toonMaterial(0xd95a4a));
  apple.position.set(0.36, 0.46, 0.18);
  apple.castShadow = true;
  outlined(apple, 1.08);
  group.add(apple);

  const note = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.02), toonMaterial(CREAM));
  note.position.set(-0.05, 0.86, 0.16);
  note.rotation.z = -0.1;
  outlined(note, 1.06);
  group.add(note);

  return { group };
}

  /** A warm post lamp that switches itself on once night falls. */
  export function buildGardenLamp(position: { x: number; z: number }): InteriorProp {
    const group = new THREE.Group();
    group.position.set(position.x, 0, position.z);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 10), toonMaterial(STONE));
    base.position.y = 0.03;
    base.castShadow = true;
    outlined(base, 1.05);
    group.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.15, 6), toonMaterial(WOOD_DARK));
    pole.position.y = 0.6;
    pole.castShadow = true;
    outlined(pole, 1.06);
    group.add(pole);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.24, 10), toonMaterial(0x6b4f42));
    shade.position.y = 1.24;
    shade.castShadow = true;
    outlined(shade, 1.05);
    group.add(shade);

    const bulbMat = new THREE.MeshBasicMaterial({ color: LAMP_GLOW, transparent: true, opacity: 0.22 });
    const bulb = new THREE.Mesh(sphereGeometry(0.1, 10), bulbMat);
    bulb.position.y = 1.22;
    group.add(bulb);

    return {
      group,
      setNight: (amount) => {
        bulbMat.opacity = 0.22 + amount * 0.78;
      }
    };
  }

  /** A bench with a book that never leaves the same page. */
  export function buildReadingBench(position: { x: number; z: number }, rotation = 0): InteriorProp {
    const group = new THREE.Group();
    group.position.set(position.x, 0, position.z);
    group.rotation.y = rotation;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.42), toonMaterial(WOOD));
    seat.position.y = 0.44;
    seat.castShadow = true;
    outlined(seat, 1.03);
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 0.1), toonMaterial(WOOD));
    back.position.set(0, 0.7, -0.16);
    back.rotation.x = 0.08;
    back.castShadow = true;
    outlined(back, 1.03);
    group.add(back);

    for (const x of [-0.52, 0.52]) {
      for (const z of [-0.16, 0.16]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.07), toonMaterial(WOOD_DARK));
        leg.position.set(x, 0.21, z);
        outlined(leg, 1.05);
        group.add(leg);
      }
    }

    const book = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.3), toonMaterial(CREAM));
    book.position.set(0.12, 0.51, 0.02);
    book.rotation.y = -0.08;
    book.castShadow = true;
    outlined(book, 1.05);
    group.add(book);

    const page = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.015, 0.27), toonMaterial(0xfffaf2));
    page.position.set(0.12, 0.535, 0.02);
    page.rotation.y = -0.08;
    group.add(page);

    return { group };
  }

  /** A low tea table with two cushions and a still-warm pot. */
  export function buildTeaTable(position: { x: number; z: number }, rotation = 0): InteriorProp {
    const group = new THREE.Group();
    group.position.set(position.x, 0, position.z);
    group.rotation.y = rotation;

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.08, 12), toonMaterial(WOOD));
    top.position.y = 0.34;
    top.castShadow = true;
    outlined(top, 1.02);
    group.add(top);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.32, 8), toonMaterial(WOOD_DARK));
    stem.position.y = 0.16;
    outlined(stem, 1.06);
    group.add(stem);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.05, 10), toonMaterial(WOOD_DARK));
    foot.position.y = 0.025;
    outlined(foot, 1.04);
    group.add(foot);

    const pot = new THREE.Mesh(sphereGeometry(0.13, 10), toonMaterial(ROSE));
    pot.position.set(0, 0.47, 0);
    pot.castShadow = true;
    outlined(pot, 1.06);
    group.add(pot);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 8), toonMaterial(WOOD_DARK));
    lid.position.y = 0.08;
    pot.add(lid);

    for (const x of [-0.24, 0.26]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.07, 8), toonMaterial(CREAM));
      cup.position.set(x, 0.415, 0.12);
      outlined(cup, 1.08);
      group.add(cup);
    }

    for (const [x, color] of [
      [-0.62, ROSE],
      [0.66, 0xf2c14e]
    ] as const) {
      const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.09, 10), toonMaterial(color));
      cushion.position.set(x, 0.055, -0.28);
      cushion.castShadow = true;
      outlined(cushion, 1.05);
      group.add(cushion);
    }

    return { group };
  }

  /** A woven rug to sit together without walking all the way to the forest. */
  export function buildPicnicRug(position: { x: number; z: number }, rotation = 0): InteriorProp {
    const group = new THREE.Group();
    group.position.set(position.x, 0, position.z);
    group.rotation.y = rotation;

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.025, 24), toonMaterial(CREAM));
    base.position.y = 0.015;
    base.receiveShadow = true;
    outlined(base, 1.01);
    group.add(base);

    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.028, 24), toonMaterial(ROSE));
    center.position.y = 0.032;
    center.receiveShadow = true;
    outlined(center, 1.01);
    group.add(center);

    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.14, 8), toonMaterial(0xd9a58c));
    basket.position.set(-0.5, 0.09, 0.4);
    basket.castShadow = true;
    outlined(basket, 1.06);
    group.add(basket);

    return { group };
  }

  export interface DecorBuildOptions {
    /** Photo file name for a photo-frame, or null for the painted polaroid. */
    photo?: string | null;
    /** Body colour for the aquarium fish, or null for an empty bowl. */
    fishColor?: number | null;
    finColor?: number;
  }

  /** Builds any yard furniture by id so the decor system stays data-driven. */
  export function buildDecorItem(
    id: string,
    position: { x: number; z: number },
    rotation = 0,
    options: DecorBuildOptions = {}
  ): InteriorProp {
    switch (id) {
      case 'photo-frame':
        return buildPhotoFrame(position, rotation, { photo: options.photo ?? null });
      case 'aquarium':
        return buildAquarium(position, {
          fishColor: options.fishColor ?? null,
          finColor: options.finColor
        });
      case 'flower-pots':
        return buildFlowerPots(position);
      case 'harvest-shelf':
        return buildHarvestShelf(position, rotation);
      case 'garden-lamp':
        return buildGardenLamp(position);
      case 'reading-bench':
        return buildReadingBench(position, rotation);
      case 'tea-table':
        return buildTeaTable(position, rotation);
      case 'picnic-rug':
        return buildPicnicRug(position, rotation);
      default:
        return { group: new THREE.Group() };
    }
  }