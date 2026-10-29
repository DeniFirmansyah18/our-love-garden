import * as THREE from 'three';
import { outlined, toonMaterial } from '../entities/toon';

const TRUNK = 0xa97a5a;
const LEAF_A = 0x9dbe86;
const LEAF_B = 0x86ab74;
const LEAF_C = 0xb6cd9a;
const STONE = 0xd8cfc0;
const WOOD = 0xc09068;
const WOOD_DARK = 0x9a6d4c;
const LAMP_GLOW = 0xffd79a;

export function buildTree(scale = 1, variant = 0): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13 * scale, 0.22 * scale, 1.15 * scale, 7),
    toonMaterial(TRUNK)
  );
  trunk.position.y = 0.57 * scale;
  trunk.castShadow = true;
  outlined(trunk, 1.06);
  group.add(trunk);

  const palettes = [LEAF_A, LEAF_B, LEAF_C];
  const puffs = [
    [0, 1.5, 0, 0.72],
    [-0.36, 1.26, 0.14, 0.5],
    [0.34, 1.3, -0.1, 0.54],
    [0.08, 1.08, 0.34, 0.42]
  ];
  puffs.forEach((puff, index) => {
    const [x, y, z, radius] = puff;
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(radius * scale, 14, 10),
      toonMaterial(palettes[(variant + index) % palettes.length])
    );
    leaf.position.set(x * scale, y * scale, z * scale);
    leaf.scale.set(1, 0.92, 1);
    leaf.castShadow = true;
    outlined(leaf, 1.04);
    group.add(leaf);
  });

  return group;
}

export function buildBush(scale = 1, color = LEAF_B): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const angle = (i / 3) * Math.PI * 2;
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.34 * scale, 12, 9),
      toonMaterial(i === 0 ? color : LEAF_A)
    );
    puff.position.set(Math.cos(angle) * 0.26 * scale, 0.24 * scale, Math.sin(angle) * 0.26 * scale);
    puff.scale.set(1, 0.82, 1);
    puff.castShadow = true;
    outlined(puff, 1.05);
    group.add(puff);
  }
  return group;
}

export function buildRock(scale = 1): THREE.Mesh {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 * scale, 0), toonMaterial(STONE));
  rock.scale.set(1.2, 0.72, 1);
  rock.castShadow = true;
  outlined(rock, 1.05);
  return rock;
}

export function buildLantern(color = LAMP_GLOW): { group: THREE.Group; glow: THREE.Mesh } {
  const group = new THREE.Group();

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.5, 7), toonMaterial(WOOD_DARK));
  post.position.y = 0.75;
  post.castShadow = true;
  outlined(post, 1.07);
  group.add(post);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.06), toonMaterial(WOOD_DARK));
  arm.position.set(0.15, 1.5, 0);
  group.add(arm);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshBasicMaterial({ color })
  );
  glow.position.set(0.3, 1.32, 0);
  group.add(glow);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.14, 8), toonMaterial(WOOD_DARK));
  cap.position.set(0.3, 1.48, 0);
  group.add(cap);

  return { group, glow };
}

export function buildBench(): THREE.Group {
  const group = new THREE.Group();

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.52), toonMaterial(WOOD));
  seat.position.y = 0.46;
  seat.castShadow = true;
  outlined(seat, 1.03);
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 0.1), toonMaterial(WOOD));
  back.position.set(0, 0.72, -0.22);
  back.rotation.x = -0.1;
  back.castShadow = true;
  outlined(back, 1.04);
  group.add(back);

  for (const x of [-0.58, 0.58]) {
    for (const z of [-0.18, 0.18]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.44, 0.1), toonMaterial(WOOD_DARK));
      leg.position.set(x, 0.22, z);
      leg.castShadow = true;
      group.add(leg);
    }
  }

  return group;
}

export function buildSign(textTexture?: THREE.Texture): THREE.Group {
  const group = new THREE.Group();

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.1, 6), toonMaterial(WOOD_DARK));
  post.position.y = 0.55;
  post.castShadow = true;
  outlined(post, 1.06);
  group.add(post);

  const board = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.5, 0.08), toonMaterial(0xf4dfc0));
  board.position.y = 1.08;
  board.castShadow = true;
  outlined(board, 1.04);
  group.add(board);

  if (textTexture) {
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.45),
      new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
    );
    face.position.set(0, 1.08, 0.05);
    group.add(face);
  }

  return group;
}

export function buildSteppingStone(radius: number): THREE.Mesh {
  const stone = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.05, 0.07, 9),
    toonMaterial(0xe9dcc6)
  );
  stone.receiveShadow = true;
  return stone;
}