import * as THREE from 'three';
import { LOVE } from '../data/config';
import { SPOTS } from '../data/zones';
import { outlined, sphereGeometry, toonMaterial } from '../entities/toon';
import { buildBench, buildLantern, buildSign, buildTree } from './props';
import type { Collider, DistrictPiece } from './types';

const WOOD = 0xc09068;
const WOOD_DARK = 0x9a6d4c;
const CREAM = 0xfff1da;
const ROSE = 0xe08d9e;
const PINK_SAND = 0xf7d9d2;
const STONE = 0xd8cfc0;
const CRYSTAL = 0xa78bfa;
const MUSHROOM = 0x8fe3d0;

function place(
  group: THREE.Group,
  position: { x: number; z: number },
  rotation = 0
): THREE.Group {
  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotation;
  return group;
}

/** Our little crooked house, scaled for the wider island. */
export function buildHouseDistrict(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const foundation = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.6, 0.24, 12),
    toonMaterial(0xe3d3be)
  );
  foundation.position.y = 0.12;
  foundation.receiveShadow = true;
  group.add(foundation);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(2.08, 2.18, 2.5, 14),
    toonMaterial(CREAM)
  );
  wall.position.y = 1.48;
  wall.castShadow = true;
  wall.receiveShadow = true;
  outlined(wall, 1.01);
  group.add(wall);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.9, 1.85, 14),
    toonMaterial(ROSE)
  );
  roof.position.y = 3.6;
  roof.castShadow = true;
  outlined(roof, 1.02);
  group.add(roof);

  const roofTip = new THREE.Mesh(sphereGeometry(0.16, 10), toonMaterial(0xf7d59a));
  roofTip.position.y = 4.58;
  group.add(roofTip);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.45, 0.14), toonMaterial(0xb8705e));
  door.position.set(0, 0.86, 2.09);
  door.castShadow = true;
  outlined(door, 1.04);
  group.add(door);

  const knob = new THREE.Mesh(sphereGeometry(0.06, 8), toonMaterial(0xf7d59a));
  knob.position.set(0.26, 0.86, 2.18);
  group.add(knob);

  for (const x of [-1.24, 1.24]) {
    const frame = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), toonMaterial(0xffe3a3));
    frame.position.set(x, 1.8, 1.94);
    frame.rotation.y = x > 0 ? -0.24 : 0.24;
    group.add(frame);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.33, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd79a })
    );
    glow.position.set(x, 1.8, 1.96);
    glow.rotation.y = x > 0 ? -0.24 : 0.24;
    glow.userData.night = true;
    group.add(glow);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.04, 0.02), toonMaterial(0xb8705e));
    crossH.position.set(x, 1.8, 1.98);
    crossH.rotation.y = x > 0 ? -0.24 : 0.24;
    group.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.66, 0.02), toonMaterial(0xb8705e));
    crossV.position.copy(crossH.position);
    crossV.rotation.y = crossH.rotation.y;
    group.add(crossV);
  }

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.05, 0.4), toonMaterial(0xd9a58c));
  chimney.position.set(1.15, 3.85, -0.75);
  chimney.rotation.z = -0.06;
  chimney.castShadow = true;
  outlined(chimney, 1.05);
  group.add(chimney);

  const smoke = new THREE.Mesh(
    sphereGeometry(0.26, 10),
    new THREE.MeshBasicMaterial({ color: 0xfffaf2, transparent: true, opacity: 0.45 })
  );
  smoke.position.set(1.28, 4.55, -0.78);
  group.add(smoke);

  const step = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 0.6), toonMaterial(0xe9d8ba));
  step.position.set(0, 0.08, 2.42);
  step.receiveShadow = true;
  outlined(step, 1.03);
  group.add(step);

  const doorLight = new THREE.PointLight(0xffc98a, 0, 7, 2);
  doorLight.position.set(0, 2.2, 2.5);
  doorLight.userData.night = true;
  group.add(doorLight);

  place(group, { x: -11, z: -1 }, Math.PI / 2);
  colliders.push({ x: -11, z: -1, radius: 2.5 });

  return {
    group,
    colliders,
    update: (dt) => {
      smoke.position.y = 4.55 + Math.sin(performance.now() / 900) * 0.12;
      void dt;
    }
  };
}

export function buildWindmill(position: { x: number; z: number }): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.85, 0.5, 10), toonMaterial(STONE));
  base.position.y = 0.25;
  base.receiveShadow = true;
  group.add(base);

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.35, 4.2, 10), toonMaterial(CREAM));
  tower.position.y = 2.6;
  tower.castShadow = true;
  outlined(tower, 1.02);
  group.add(tower);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.9, 10), toonMaterial(ROSE));
  cap.position.y = 5.05;
  cap.castShadow = true;
  outlined(cap, 1.03);
  group.add(cap);

  const blades = new THREE.Group();
  blades.position.set(0, 4.75, 0.95);
  for (let i = 0; i < 4; i += 1) {
    const arm = new THREE.Group();
    arm.rotation.z = (i / 4) * Math.PI * 2;
    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.1, 0.08), toonMaterial(0xf4dfc0));
    sail.position.y = 1.15;
    sail.castShadow = true;
    outlined(sail, 1.05);
    arm.add(sail);
    blades.add(arm);
  }
  blades.add(new THREE.Mesh(sphereGeometry(0.18, 10), toonMaterial(WOOD_DARK)));
  group.add(blades);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.05, 0.12), toonMaterial(WOOD_DARK));
  door.position.set(0, 0.85, 1.24);
  group.add(door);

  place(group, position, 0.4);
  colliders.push({ x: position.x, z: position.z, radius: 1.5 });

  return {
    group,
    colliders,
    update: (dt) => {
      blades.rotation.z += dt * 0.55;
    }
  };
}

export function buildDockAndBoat(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const plankGeometry = new THREE.BoxGeometry(2.1, 0.1, 0.55);
  const plankMaterial = toonMaterial(WOOD);
  const planks = new THREE.InstancedMesh(plankGeometry, plankMaterial, 8);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 8; i += 1) {
    matrix.makeTranslation(0, 0.16 + (i % 2) * 0.012, -8.1 - i * 0.62);
    planks.setMatrixAt(i, matrix);
  }
  planks.instanceMatrix.needsUpdate = true;
  planks.receiveShadow = true;
  planks.castShadow = true;
  group.add(planks);

  for (const z of [-8.2, -10.5, -12.7]) {
    for (const x of [-1.05, 1.05]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.2, 6), toonMaterial(WOOD_DARK));
      post.position.set(x, 0.05, z);
      post.castShadow = true;
      group.add(post);
    }
  }

  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 4.6), toonMaterial(WOOD_DARK));
  rail.position.set(-1.05, 0.72, -10.4);
  group.add(rail);
  for (const z of [-8.2, -10.4, -12.6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.56, 5), toonMaterial(WOOD_DARK));
    post.position.set(-1.05, 0.45, z);
    group.add(post);
  }

  const lamp = buildLantern(0xffd79a);
  lamp.group.position.set(1.2, 0.16, -12.4);
  lamp.group.scale.setScalar(0.85);
  group.add(lamp.group);

  const boat = new THREE.Group();
  const hull = new THREE.Mesh(sphereGeometry(0.95, 16), toonMaterial(0xb8705e));
  hull.scale.set(1, 0.52, 1.9);
  hull.position.y = 0.18;
  hull.castShadow = true;
  outlined(hull, 1.04);
  boat.add(hull);

  const inner = new THREE.Mesh(sphereGeometry(0.78, 14), toonMaterial(0xf4dfc0));
  inner.scale.set(1, 0.42, 1.75);
  inner.position.y = 0.3;
  boat.add(inner);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.09, 0.34), toonMaterial(WOOD));
  seat.position.set(0, 0.42, -0.2);
  boat.add(seat);

  const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 5), toonMaterial(WOOD_DARK));
  oar.position.set(0.7, 0.45, 0.5);
  oar.rotation.z = 0.6;
  boat.add(oar);

  boat.position.set(3.6, 0, -12.2);
  boat.rotation.y = 0.4;
  group.add(boat);
  colliders.push({ x: 3.6, z: -12.2, radius: 1 });

  const pads: Array<[number, number, number]> = [
    [2.2, -13.2, 0.42],
    [4.8, -14.1, 0.34],
    [-0.8, -14.4, 0.36],
    [1.1, -15.6, 0.3],
    [5.6, -11.6, 0.28]
  ];
  for (const [x, z, radius] of pads) {
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.04, 12),
      toonMaterial(0x8fb47d)
    );
    pad.position.set(x, -0.05, z);
    group.add(pad);

    const bloom = new THREE.Mesh(sphereGeometry(radius * 0.42, 10), toonMaterial(0xf8cdd6));
    bloom.scale.set(1, 0.5, 1);
    bloom.position.set(x + 0.05, 0.03, z + 0.05);
    group.add(bloom);
  }

  return {
    group,
    colliders,
    update: (dt, time) => {
      boat.position.y = Math.sin(time * 0.8) * 0.05;
      boat.rotation.z = Math.sin(time * 0.7) * 0.02;
      void dt;
    }
  };
}

export function buildForestGrove(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const bigTreeSpots: Array<[number, number, number]> = [
    [-20.5, 7.5, 2.6],
    [-12, 6.2, 2.2],
    [-21.5, 13.5, 2.4],
    [-10.5, 14.2, 2.1],
    [-16.5, 5.2, 1.9],
    [-13.5, 16.5, 2.0]
  ];
  for (const [x, z, scale] of bigTreeSpots) {
    const tree = buildTree(scale, Math.floor(Math.abs(x + z)) % 3);
    tree.position.set(x, 0, z);
    tree.rotation.y = x * 0.3 + z * 0.2;
    group.add(tree);
    colliders.push({ x, z, radius: 0.55 * scale });
  }

  const mushroomGeometry = new THREE.SphereGeometry(0.22, 10, 8);
  const mushMaterial = new THREE.MeshBasicMaterial({ color: MUSHROOM });
  const mushrooms = new THREE.InstancedMesh(mushroomGeometry, mushMaterial, 26);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  for (let i = 0; i < 26; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 5.5;
    const x = -16 + Math.cos(angle) * radius;
    const z = 10 + Math.sin(angle) * radius;
    const scale = 0.6 + Math.random() * 0.9;
    matrix.compose(
      new THREE.Vector3(x, 0.14 * scale, z),
      new THREE.Quaternion(),
      new THREE.Vector3(scale, scale * 0.8, scale)
    );
    mushrooms.setMatrixAt(i, matrix);
    color.setHSL(0.42 + Math.random() * 0.12, 0.55, 0.68);
    mushrooms.setColorAt(i, color);
  }
  mushrooms.instanceMatrix.needsUpdate = true;
  if (mushrooms.instanceColor) mushrooms.instanceColor.needsUpdate = true;
  group.add(mushrooms);

  const stems = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.055, 0.07, 0.3, 5),
    toonMaterial(0xfff1da),
    26
  );
  for (let i = 0; i < 26; i += 1) {
    mushrooms.getMatrixAt(i, matrix);
    const position = new THREE.Vector3().setFromMatrixPosition(matrix);
    const scale = position.y / 0.14;
    matrix.makeTranslation(position.x, position.y * 0.4, position.z);
    matrix.scale(new THREE.Vector3(scale, scale, scale));
    stems.setMatrixAt(i, matrix);
  }
  stems.instanceMatrix.needsUpdate = true;
  group.add(stems);

  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.6, 8), toonMaterial(WOOD_DARK));
  log.rotation.z = Math.PI / 2;
  log.rotation.y = 0.6;
  log.position.set(-18.6, 0.36, 9.2);
  log.castShadow = true;
  outlined(log, 1.04);
  group.add(log);
  colliders.push({ x: -18.6, z: 9.2, radius: 1.1 });

  const picnic = buildPicnicBlanket({ x: -14.5, z: 12 });
  group.add(picnic);

  return { group, colliders };
}

function buildPicnicBlanket(position: { x: number; z: number }): THREE.Group {
  const group = new THREE.Group();
  const blanket = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.05, 2.4),
    toonMaterial(0xf8cdd6)
  );
  blanket.rotation.y = 0.3;
  blanket.position.y = 0.03;
  blanket.receiveShadow = true;
  group.add(blanket);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.28, 0.03, 0.18), toonMaterial(0xfff1da));
  trim.rotation.y = 0.3;
  trim.position.set(0, 0.06, 1.1);
  group.add(trim);

  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.29, 0.36, 10), toonMaterial(0xc9a06a));
  basket.position.set(0.9, 0.22, -0.2);
  basket.castShadow = true;
  outlined(basket, 1.05);
  group.add(basket);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 6, 14, Math.PI), toonMaterial(0x8e5f3d));
  handle.position.set(0.9, 0.42, -0.2);
  group.add(handle);

  for (const dir of [-1, 1]) {
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 12), toonMaterial(0xf7d59a));
    cushion.position.set(dir * 0.95, 0.1, 0.65);
    group.add(cushion);
  }

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.14, 8), toonMaterial(0xfff1da));
  cup.position.set(0.45, 0.12, 0.3);
  group.add(cup);

  group.position.set(position.x, 0, position.z);
  return group;
}

export function buildMiniPond(): DistrictPiece {
  const group = new THREE.Group();
  const center = { x: -19.5, z: 12.2 };
  const radius = 1.9;

  const basin = new THREE.Mesh(new THREE.CircleGeometry(radius * 1.25, 22), toonMaterial(0xd8cfc0));
  basin.rotation.x = -Math.PI / 2;
  basin.position.set(center.x, 0.01, center.z);
  group.add(basin);

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshToonMaterial({ color: 0x8fc7c4, transparent: true, opacity: 0.9 })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(center.x, 0.04, center.z);
  group.add(water);

  for (let i = 0; i < 9; i += 1) {
    const angle = (i / 9) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.06, 0), toonMaterial(STONE));
    stone.position.set(
      center.x + Math.cos(angle) * radius * 1.12,
      0.05,
      center.z + Math.sin(angle) * radius * 1.12
    );
    group.add(stone);
  }

  const coral = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), toonMaterial(0xf0a9b8));
  coral.scale.set(1, 0.7, 1);
  coral.position.set(center.x + 0.4, 0.12, center.z - 0.3);
  group.add(coral);

  return { group, colliders: [{ x: center.x, z: center.z, radius: radius * 1.05 }] };
}

export function buildHillDistrict(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const bench = buildBench();
  bench.position.set(15.5, 0, 12.2);
  bench.rotation.y = -1.35;
  group.add(bench);
  colliders.push({ x: 15.5, z: 12.2, radius: 0.9 });

  const kiteGroup = new THREE.Group();
  kiteGroup.position.set(10, 0, 17.5);

  const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.7, 5), toonMaterial(WOOD_DARK));
  stake.position.y = 0.35;
  group.add(stake);

  const kite = new THREE.Group();
  kite.position.set(0, 4.6, 0);

  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), toonMaterial(0xf0a9b8));
  sail.rotation.z = Math.PI / 4;
  sail.material.side = THREE.DoubleSide;
  kite.add(sail);

  const frameH = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.04, 0.04), toonMaterial(WOOD_DARK));
  frameH.rotation.z = Math.PI / 4;
  kite.add(frameH);
  const frameV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.9, 0.04), toonMaterial(WOOD_DARK));
  frameV.rotation.z = Math.PI / 4;
  kite.add(frameV);

  const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.7), toonMaterial(0xf7d59a));
  tail.position.set(0.2, -1.1, 0);
  kite.add(tail);

  kiteGroup.add(kite);
  group.add(kiteGroup);

  const stringGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(10, 0.7, 17.5),
    new THREE.Vector3(10, 4.6, 17.5)
  ]);
  const string = new THREE.Line(
    stringGeometry,
    new THREE.LineBasicMaterial({ color: 0xfff1da, transparent: true, opacity: 0.7 })
  );
  group.add(string);

  const daisies = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.1, 8, 6),
    toonMaterial(0xfffaf2),
    40
  );
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 40; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 6;
    matrix.makeTranslation(
      13 + Math.cos(angle) * radius,
      0.14,
      15 + Math.sin(angle) * radius
    );
    daisies.setMatrixAt(i, matrix);
  }
  daisies.instanceMatrix.needsUpdate = true;
  group.add(daisies);

  return {
    group,
    colliders,
    update: (dt, time) => {
      kite.position.y = 4.6 + Math.sin(time * 1.2) * 0.25;
      kite.position.x = Math.sin(time * 0.9) * 0.5;
      kite.rotation.z = Math.sin(time * 1.4) * 0.12;
      stringGeometry.setFromPoints([
        new THREE.Vector3(10, 0.7, 17.5),
        new THREE.Vector3(10 + kite.position.x, kite.position.y - 0.6, 17.5)
      ]);
      void dt;
    }
  };
}

export function buildBeachDistrict(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const sand = new THREE.Mesh(new THREE.CircleGeometry(9, 30), toonMaterial(PINK_SAND));
  sand.rotation.x = -Math.PI / 2;
  sand.scale.set(1, 0.85, 1);
  sand.position.set(26, 0.02, 3);
  sand.receiveShadow = true;
  group.add(sand);

  const shellGeometry = new THREE.ConeGeometry(0.12, 0.2, 6);
  const shells = new THREE.InstancedMesh(shellGeometry, toonMaterial(0xfff1da), 22);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const color = new THREE.Color();
  for (let i = 0; i < 22; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1 + Math.random() * 7;
    const x = 25.5 + Math.cos(angle) * radius;
    const z = 3 + Math.sin(angle) * radius * 0.8;
    quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, Math.random() * 3, 0));
    matrix.compose(
      new THREE.Vector3(x, 0.08, z),
      quaternion,
      new THREE.Vector3(0.8 + Math.random() * 0.6, 0.8, 0.8)
    );
    shells.setMatrixAt(i, matrix);
    color.setHSL(0.95, 0.25 + Math.random() * 0.2, 0.85);
    shells.setColorAt(i, color);
  }
  shells.instanceMatrix.needsUpdate = true;
  if (shells.instanceColor) shells.instanceColor.needsUpdate = true;
  group.add(shells);

  const crab = buildCrab();
  crab.group.position.set(26, 0, 6.4);
  group.add(crab.group);
  colliders.push({ x: 26, z: 6.4, radius: 0.4 });

  const driftwood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 0.34), toonMaterial(WOOD));
  driftwood.position.set(28.4, 0.12, 0.8);
  driftwood.rotation.y = 0.8;
  driftwood.castShadow = true;
  outlined(driftwood, 1.04);
  group.add(driftwood);

  const names = buildSandNames({ x: 26.5, z: 4.5 });
  group.add(names);

  const umbrella = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5), toonMaterial(WOOD_DARK));
  pole.position.y = 1.1;
  umbrella.add(pole);
  for (let i = 0; i < 6; i += 1) {
    const panel = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 1.1, 6, 1, true, (i / 6) * Math.PI * 2, Math.PI / 3),
      toonMaterial(i % 2 === 0 ? 0xf0a9b8 : 0xfff1da)
    );
    panel.position.y = 2.15;
    panel.material.side = THREE.DoubleSide;
    umbrella.add(panel);
  }
  umbrella.position.set(22.6, 0, 1.2);
  group.add(umbrella);
  colliders.push({ x: 22.6, z: 1.2, radius: 0.4 });

  return {
    group,
    colliders,
    update: (dt, time) => crab.update(dt, time)
  };
}

function buildCrab(): { group: THREE.Group; update: (dt: number, time: number) => void } {
  const group = new THREE.Group();
  const body = new THREE.Mesh(sphereGeometry(0.28, 12), toonMaterial(0xe2666f));
  body.scale.set(1.2, 0.7, 1);
  body.position.y = 0.22;
  body.castShadow = true;
  outlined(body, 1.06);
  group.add(body);

  for (const dir of [-1, 1]) {
    const claw = new THREE.Mesh(sphereGeometry(0.13, 10), toonMaterial(0xd5566e));
    claw.scale.set(1, 0.7, 0.8);
    claw.position.set(dir * 0.36, 0.2, 0.14);
    outlined(claw, 1.08);
    group.add(claw);

    const eye = new THREE.Mesh(sphereGeometry(0.05, 8), new THREE.MeshBasicMaterial({ color: 0x3b1a15 }));
    eye.position.set(dir * 0.1, 0.42, 0.2);
    group.add(eye);

    for (let i = 0; i < 3; i += 1) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 4), toonMaterial(0xd5566e));
      leg.position.set(dir * (0.22 + i * 0.06), 0.1, -0.08 - i * 0.06);
      leg.rotation.z = dir * 0.7;
      group.add(leg);
    }
  }

  let phase = 0;
  return {
    group,
    update: (dt, time) => {
      phase += dt * 1.6;
      group.position.x = 26 + Math.sin(time * 0.35) * 2.2;
      group.position.z = 6.4 + Math.cos(time * 0.28) * 0.9;
      group.rotation.y = Math.sin(time * 0.35) * 1.2;
      group.position.y = Math.abs(Math.sin(phase * 4)) * 0.03;
    }
  };
}

function buildSandNames(position: { x: number; z: number }): THREE.Group {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(160, 98, 92, 0.72)';
    ctx.textAlign = 'center';
    ctx.font = 'italic 62px Georgia, serif';
    ctx.fillText('Deni', 176, 118);
    ctx.fillText('&', 256, 150);
    ctx.fillText('Jihan', 336, 182);
    ctx.strokeStyle = 'rgba(160, 98, 92, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(196, 196);
    ctx.quadraticCurveTo(256, 210, 316, 196);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 2.6),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(position.x, 0.06, position.z);
  mesh.rotation.z = -0.12;

  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

export function buildBridgeAndIslet(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const start = new THREE.Vector3(31.4, 0, 9.4);
  const end = new THREE.Vector3(35.2, 0, 11.2);
  const length = start.distanceTo(end);
  const planks = Math.ceil(length / 0.55);

  const deck = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.7, 0.1, 0.48),
    toonMaterial(WOOD),
    planks
  );
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, Math.atan2(end.x - start.x, end.z - start.z), 0)
  );
  for (let i = 0; i < planks; i += 1) {
    const t = i / Math.max(1, planks - 1);
    matrix.compose(
      new THREE.Vector3(
        start.x + (end.x - start.x) * t,
        0.16 + Math.sin(t * Math.PI) * 0.12,
        start.z + (end.z - start.z) * t
      ),
      quaternion,
      new THREE.Vector3(1, 1, 1)
    );
    deck.setMatrixAt(i, matrix);
  }
  deck.instanceMatrix.needsUpdate = true;
  deck.castShadow = true;
  group.add(deck);

  for (const t of [0, 0.5, 1]) {
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.9, 5), toonMaterial(WOOD_DARK));
      post.position.set(
        start.x + (end.x - start.x) * t + side * 0.85,
        0.45,
        start.z + (end.z - start.z) * t
      );
      group.add(post);
    }
  }

  const islet = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.1, 0.6, 22), toonMaterial(0xaccb90));
  ground.position.y = -0.3;
  ground.receiveShadow = true;
  islet.add(ground);

  const sandRing = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.45, 0.24, 22), toonMaterial(PINK_SAND));
  sandRing.position.y = -0.56;
  islet.add(sandRing);

  const palm = buildTree(1.5, 1);
  palm.position.set(1.4, 0, -0.8);
  islet.add(palm);
  colliders.push({ x: 37.4, z: 10.7, radius: 0.8 });

  const bench = buildBench();
  bench.position.set(-1.2, 0, 1);
  bench.rotation.y = 2.3;
  bench.scale.setScalar(0.85);
  islet.add(bench);

  const lantern = buildLantern();
  lantern.group.position.set(-1.6, 0, -1.6);
  islet.add(lantern.group);

  islet.position.set(37, 0, 11);
  group.add(islet);

  return { group, colliders };
}

export function buildCave(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];
  const center = { x: -21, z: -13 };

  const rocks: Array<[number, number, number, number]> = [
    [-24.2, -11.2, 3.2, 1.36],
    [-21.4, -10.4, 2.4, 1.1],
    [-18.2, -11.4, 2.6, 1.24],
    [-24.6, -14.6, 2.8, 1.3],
    [-18.4, -14.8, 2.4, 1.12]
  ];
  for (const [x, z, radius, scale] of rocks) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 0), toonMaterial(0xbdb2a4));
    rock.scale.set(scale, 1.35, scale);
    rock.position.set(x, radius * 0.55, z);
    rock.rotation.set(Math.random(), Math.random() * 3, Math.random() * 0.3);
    rock.castShadow = true;
    outlined(rock, 1.03);
    group.add(rock);
    colliders.push({ x, z, radius: radius * 0.75 });
  }

  const mouth = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 20),
    new THREE.MeshBasicMaterial({ color: 0x2b2340 })
  );
  mouth.position.set(center.x + 0.4, 1.2, center.z + 2.2);
  mouth.rotation.y = 0.2;
  group.add(mouth);

  const crystals: THREE.Mesh[] = [];
  const crystalMaterial = new THREE.MeshBasicMaterial({ color: CRYSTAL });
  for (let i = 0; i < 9; i += 1) {
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.24 + Math.random() * 0.3, 0), crystalMaterial);
    const angle = (i / 9) * Math.PI * 2;
    const radius = 2.2 + Math.random() * 2.2;
    crystal.position.set(
      center.x + 1.2 + Math.cos(angle) * radius,
      0.4 + Math.random() * 1.6,
      center.z + 0.6 + Math.sin(angle) * radius
    );
    crystal.scale.set(0.7, 1.6 + Math.random(), 0.7);
    crystal.rotation.set(Math.random(), Math.random(), Math.random() * 0.4);
    group.add(crystal);
    crystals.push(crystal);
  }

  const glow = new THREE.PointLight(0xb69bff, 6, 12, 2);
  glow.position.set(center.x + 1.2, 2.2, center.z + 0.8);
  group.add(glow);

  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.34, 8, 22, Math.PI), toonMaterial(0xa79b8c));
  arch.position.set(center.x + 0.4, 1.4, center.z + 2.15);
  arch.rotation.y = 0.2;
  arch.castShadow = true;
  group.add(arch);

  return {
    group,
    colliders,
    update: (_dt, time) => {
      crystals.forEach((crystal, index) => {
        crystal.rotation.y = time * 0.4 + index;
        crystal.position.y += Math.sin(time * 1.4 + index) * 0.0015;
      });
      glow.intensity = 5 + Math.sin(time * 1.6) * 1.4;
    }
  };
}

export function buildStatues(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];
  const base = { x: -14.5, z: 2.5 };

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.4, 12), toonMaterial(STONE));
  pedestal.position.set(base.x, 0.2, base.z);
  pedestal.receiveShadow = true;
  outlined(pedestal, 1.03);
  group.add(pedestal);

  const panda = new THREE.Group();
  const pandaHead = new THREE.Mesh(sphereGeometry(0.32, 14), toonMaterial(0xffffff));
  pandaHead.position.y = 1.02;
  outlined(pandaHead, 1.05);
  panda.add(pandaHead);

  const pandaBody = new THREE.Mesh(sphereGeometry(0.26, 12), toonMaterial(0xffffff));
  pandaBody.position.y = 0.6;
  pandaBody.scale.set(1, 1.2, 0.9);
  outlined(pandaBody, 1.05);
  panda.add(pandaBody);

  for (const dir of [-1, 1]) {
    const ear = new THREE.Mesh(sphereGeometry(0.1, 10), toonMaterial(0x4a1f1a));
    ear.position.set(dir * 0.22, 1.26, 0);
    panda.add(ear);
    const eye = new THREE.Mesh(sphereGeometry(0.035, 6), new THREE.MeshBasicMaterial({ color: 0x3b1a15 }));
    eye.position.set(dir * 0.11, 1.04, 0.3);
    panda.add(eye);
  }

  panda.position.set(base.x - 0.42, 0.35, base.z);
  panda.rotation.y = 0.5;
  group.add(panda);

  const bear = new THREE.Group();
  const bearHead = new THREE.Mesh(sphereGeometry(0.32, 14), toonMaterial(0xd9a58c));
  bearHead.position.y = 1.02;
  outlined(bearHead, 1.05);
  bear.add(bearHead);

  const bearBody = new THREE.Mesh(sphereGeometry(0.26, 12), toonMaterial(0xd9a58c));
  bearBody.position.y = 0.6;
  bearBody.scale.set(1, 1.2, 0.9);
  outlined(bearBody, 1.05);
  bear.add(bearBody);

  for (const dir of [-1, 1]) {
    const ear = new THREE.Mesh(sphereGeometry(0.11, 10), toonMaterial(0xb07a60));
    ear.position.set(dir * 0.22, 1.26, 0);
    bear.add(ear);
    const eye = new THREE.Mesh(sphereGeometry(0.035, 6), new THREE.MeshBasicMaterial({ color: 0x3b1a15 }));
    eye.position.set(dir * 0.11, 1.04, 0.3);
    bear.add(eye);
  }

  bear.position.set(base.x + 0.42, 0.35, base.z);
  bear.rotation.y = -0.5;
  group.add(bear);

  colliders.push({ x: base.x, z: base.z, radius: 1.3 });

  return { group, colliders };
}

export function buildPlaza(): DistrictPiece {
  const group = new THREE.Group();
  const colliders: Collider[] = [];

  const stones = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.9, 0.95, 0.06, 10),
    toonMaterial(0xe9d8ba),
    14
  );
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2;
    matrix.makeTranslation(Math.cos(angle) * 2.2, 0.03, 2 + Math.sin(angle) * 2.2);
    stones.setMatrixAt(i, matrix);
  }
  stones.instanceMatrix.needsUpdate = true;
  stones.receiveShadow = true;
  group.add(stones);

  const sign = buildSign(makeTitleTexture());
  sign.position.set(-1.6, 0, 4.6);
  sign.rotation.y = 0.2;
  group.add(sign);
  colliders.push({ x: -1.6, z: 4.6, radius: 0.4 });

  for (const x of [-4.2, 4.2]) {
    const lantern = buildLantern();
    lantern.group.position.set(x, 0, 1.2);
    group.add(lantern.group);
    colliders.push({ x, z: 1.2, radius: 0.35 });
  }

  const fountain = new THREE.Group();
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.34, 16), toonMaterial(STONE));
  basin.position.y = 0.17;
  basin.castShadow = true;
  outlined(basin, 1.03);
  fountain.add(basin);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.98, 0.98, 0.06, 16),
    new THREE.MeshToonMaterial({ color: 0x9fd3d0, transparent: true, opacity: 0.85 })
  );
  water.position.y = 0.35;
  fountain.add(water);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.2, 8), toonMaterial(STONE));
  column.position.y = 0.95;
  outlined(column, 1.05);
  fountain.add(column);

  const drop = new THREE.Mesh(sphereGeometry(0.16, 10), toonMaterial(0x9fd3d0));
  drop.position.y = 1.6;
  fountain.add(drop);

  fountain.position.set(0, 0, 2);
  group.add(fountain);
  colliders.push({ x: 0, z: 2, radius: 1.3 });

  return { group, colliders };
}

export function buildSpotMarkers(): {
  group: THREE.Group;
  markers: Map<string, THREE.Group>;
} {
  const group = new THREE.Group();
  const markers = new Map<string, THREE.Group>();

  for (const spot of SPOTS) {
    const marker = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.03, 6, 20),
      new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    marker.add(ring);

    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xfff0b8, transparent: true, opacity: 0.85 })
    );
    spark.position.y = 0.55;
    marker.add(spark);

    marker.position.set(spot.position.x, 0, spot.position.z);
    group.add(marker);
    markers.set(spot.id, marker);
  }

  return { group, markers };
}

function makeTitleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = '#5c3a30';
    ctx.textAlign = 'center';
    ctx.font = 'italic 68px Georgia, serif';
    ctx.fillText(LOVE.title.replace('Our ', 'Our '), 256, 104);
    ctx.font = 'italic 40px Georgia, serif';
    ctx.fillText('Deni & Jihan', 256, 168);
    ctx.strokeStyle = 'rgba(74, 31, 26, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 196);
    ctx.lineTo(362, 196);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}