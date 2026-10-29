import * as THREE from 'three';
import { ISLAND } from '../data/config';
import {
  buildBench,
  buildBush,
  buildLantern,
  buildRock,
  buildSign,
  buildSteppingStone,
  buildTree
} from './props';
import { outlined, toonMaterial } from '../entities/toon';

const GRASS = 0xaccb90;
const GRASS_DARK = 0x8fb079;
const SOIL = 0xc9a483;
const SAND = 0xefdfc1;
const ROCK_BASE = 0xcdbca6;
const WATER = 0x9fd3d0;
const WATER_DEEP = 0x7bbcbf;

export interface Collider {
  x: number;
  z: number;
  radius: number;
}

export interface Landmarks {
  home: THREE.Vector3;
  garden: THREE.Vector3;
  pond: THREE.Vector3;
  bench: THREE.Vector3;
  center: THREE.Vector3;
}

interface TreePlacement {
  x: number;
  z: number;
  scale: number;
  variant: number;
}

const TREES: TreePlacement[] = [
  [-9.6, 5.4, 1.15, 0],
  [-11.2, 1.2, 0.95, 1],
  [-8.4, -8.6, 1.05, 2],
  [-3.2, -10.6, 0.9, 0],
  [1.8, -11.2, 1.1, 1],
  [9.4, -8.2, 1.0, 2],
  [11.4, -2.4, 0.92, 0],
  [11.0, 5.6, 1.08, 1],
  [6.6, 9.8, 0.96, 2],
  [-1.4, 11.6, 1.12, 0],
  [-7.2, 9.9, 0.88, 1],
  [4.2, -6.2, 0.72, 2],
  [-5.6, -6.0, 0.68, 0]
].map(([x, z, scale, variant]) => ({ x, z, scale, variant }));

export class Island {
  readonly group = new THREE.Group();
  readonly landmarks: Landmarks = {
    home: new THREE.Vector3(-6.4, 0, -5.6),
    garden: new THREE.Vector3(5.6, 0, 2.4),
    pond: new THREE.Vector3(5.4, 0, -6.4),
    bench: new THREE.Vector3(-10.2, 0, 2.2),
    center: new THREE.Vector3(0, 0, 1.5)
  };
  readonly colliders: Collider[] = [];
  readonly waterCenter = new THREE.Vector3(5.4, 0, -6.4);
  readonly waterRadius = 3.3;
  readonly houseDoor = new THREE.Vector3(-6.4, 0, -3.5);

  private readonly waterTexture: THREE.Texture;
  private readonly waterOverlay: THREE.Mesh;
    private pondSurface!: THREE.Mesh;
    private readonly fireflies: THREE.Points;
  private readonly fireflyMaterial: THREE.PointsMaterial;
  private readonly treePivots: THREE.Group[] = [];
    private groundMesh!: THREE.Mesh;

  constructor() {
    this.buildGround();
    this.buildPath();
    this.buildWater();
    this.waterTexture = makeRippleTexture();
    this.waterOverlay = this.buildWaterOverlay();
    this.buildHouse();
    this.buildGarden();
    this.buildTrees();
    this.buildGrass();
    this.buildFlowers();
    this.buildProps();
    const fireflies = this.buildFireflies();
    this.fireflies = fireflies.points;
    this.fireflyMaterial = fireflies.material;
    this.buildShore();
  }

  private buildGround(): void {
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.radius, ISLAND.radius * 0.965, 0.5, 48),
      toonMaterial(GRASS)
    );
    top.position.y = -0.25;
    top.receiveShadow = true;
    this.group.add(top);
        this.groundMesh = top;

    const beach = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.radius * 1.015, ISLAND.radius * 0.98, 0.26, 48),
      toonMaterial(SAND)
    );
    beach.position.y = -0.44;
    beach.receiveShadow = true;
    this.group.add(beach);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.radius * 0.97, ISLAND.radius * 0.72, 1.1, 40),
      toonMaterial(SOIL)
    );
    soil.position.y = -1.0;
    this.group.add(soil);

    const base = new THREE.Mesh(
      new THREE.ConeGeometry(ISLAND.radius * 0.7, 3.4, 32),
      toonMaterial(ROCK_BASE)
    );
    base.position.y = -3.2;
    base.rotation.y = Math.PI / 8;
    this.group.add(base);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ISLAND.radius * 0.995, 0.13, 8, 64),
      toonMaterial(GRASS_DARK)
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.02;
    this.group.add(rim);
  }

  private buildPath(): void {
    const points: Array<[number, number, number]> = [
      [0.4, 1.6, 1.5],
      [-0.6, 0.6, 1.35],
      [-1.8, -0.3, 1.25],
      [-3.0, -1.1, 1.2],
      [-4.2, -2.0, 1.1],
      [-5.3, -2.9, 1.0],
      [6.2, 9.0, 1.35],
      [5.6, 7.6, 1.3],
      [4.9, 6.2, 1.25],
      [4.3, 5.0, 1.2],
      [3.4, 4.0, 1.15],
      [2.4, 3.1, 1.1],
      [1.4, 2.4, 1.05],
      [-8.4, 4.4, 1.15],
      [-7.6, 3.6, 1.1],
      [-6.6, 2.8, 1.05],
      [-5.4, 2.2, 1.0],
      [-4.0, 2.0, 0.95],
      [-2.4, 1.9, 0.9]
    ];

    const material = new THREE.MeshToonMaterial({ color: 0xe9d8ba });
    const geometry = new THREE.CircleGeometry(1, 14);
    const instanced = new THREE.InstancedMesh(geometry, material, points.length);
    instanced.receiveShadow = true;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();

    points.forEach(([x, z, size], index) => {
      position.set(x, 0.012, z);
      scale.set(size * 0.72, size * 0.62, 1);
      matrix.compose(position, quaternion, scale);
      instanced.setMatrixAt(index, matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    this.group.add(instanced);
  }

  private buildWater(): void {
    const basin = new THREE.Mesh(
      new THREE.CircleGeometry(this.waterRadius * 1.22, 40),
      toonMaterial(SAND)
    );
    basin.rotation.x = -Math.PI / 2;
    basin.position.set(this.waterCenter.x, -0.03, this.waterCenter.z);
    basin.receiveShadow = true;
    this.group.add(basin);

    const deep = new THREE.Mesh(
      new THREE.CircleGeometry(this.waterRadius, 44),
      new THREE.MeshToonMaterial({ color: WATER_DEEP })
    );
    deep.rotation.x = -Math.PI / 2;
    deep.position.set(this.waterCenter.x, -0.28, this.waterCenter.z);
    this.group.add(deep);

    const surface = new THREE.Mesh(
      new THREE.CircleGeometry(this.waterRadius * 1.02, 44),
      new THREE.MeshToonMaterial({
        color: WATER,
        transparent: true,
        opacity: 0.82
      })
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.set(this.waterCenter.x, -0.12, this.waterCenter.z);
    this.group.add(surface);
        this.pondSurface = surface;

    for (let i = 0; i < 7; i += 1) {
      const angle = (i / 7) * Math.PI * 2 + 0.4;
      const stone = buildRock(0.7 + (i % 3) * 0.14);
      stone.position.set(
        this.waterCenter.x + Math.cos(angle) * (this.waterRadius + 0.42),
        0.02,
        this.waterCenter.z + Math.sin(angle) * (this.waterRadius + 0.42)
      );
      stone.rotation.y = angle;
      this.group.add(stone);
    }

    for (let i = 0; i < 4; i += 1) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28 + (i % 2) * 0.08, 0.28, 0.035, 12),
        toonMaterial(0x8fb47d)
      );
      const angle = i * 1.9;
      pad.position.set(
        this.waterCenter.x + Math.cos(angle) * (1.1 + i * 0.35),
        -0.1,
        this.waterCenter.z + Math.sin(angle) * (0.9 + i * 0.3)
      );
      pad.rotation.y = angle;
      this.group.add(pad);

      if (i === 1) {
        const bloom = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 10, 8),
          toonMaterial(0xf8cdd6)
        );
        bloom.scale.set(1, 0.6, 1);
        bloom.position.copy(pad.position).setY(-0.03);
        this.group.add(bloom);
      }
    }
  }

  private buildWaterOverlay(): THREE.Mesh {
    this.waterTexture.wrapS = THREE.RepeatWrapping;
    this.waterTexture.wrapT = THREE.RepeatWrapping;
    this.waterTexture.repeat.set(2.4, 2.4);
    const geometry = new THREE.CircleGeometry(this.waterRadius * 0.99, 44);
    const material = new THREE.MeshBasicMaterial({
      map: this.waterTexture,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(this.waterCenter.x, -0.1, this.waterCenter.z);
    this.group.add(mesh);
    return mesh;
  }

  private buildHouse(): void {
    const house = new THREE.Group();
    house.position.copy(this.landmarks.home);
    house.rotation.y = -0.22;
    this.group.add(house);

    const foundation = new THREE.Mesh(
      new THREE.CylinderGeometry(2.05, 2.15, 0.22, 10),
      toonMaterial(0xe3d3be)
    );
    foundation.position.y = 0.11;
    foundation.receiveShadow = true;
    house.add(foundation);

    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.78, 2.0, 12),
      toonMaterial(0xfff1da)
    );
    wall.position.y = 1.2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    outlined(wall, 1.01);
    house.add(wall);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.35, 1.5, 12),
      toonMaterial(0xe08d9e)
    );
    roof.position.y = 2.9;
    roof.castShadow = true;
    outlined(roof, 1.02);
    house.add(roof);

    const roofTip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), toonMaterial(0xf7d59a));
    roofTip.position.y = 3.7;
    house.add(roofTip);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.22, 0.12), toonMaterial(0xb8705e));
    door.position.set(0, 0.72, 1.72);
    door.castShadow = true;
    outlined(door, 1.04);
    house.add(door);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), toonMaterial(0xf7d59a));
    knob.position.set(0.22, 0.72, 1.8);
    house.add(knob);

    for (const x of [-1.02, 1.02]) {
      const windowFrame = new THREE.Mesh(new THREE.CircleGeometry(0.34, 16), toonMaterial(0xffe3a3));
      windowFrame.position.set(x, 1.5, 1.58);
      windowFrame.rotation.y = x > 0 ? -0.22 : 0.22;
      house.add(windowFrame);

      const glassGlow = new THREE.Mesh(
        new THREE.CircleGeometry(0.28, 16),
        new THREE.MeshBasicMaterial({ color: 0xffd79a })
      );
      glassGlow.position.set(x, 1.5, 1.585);
      glassGlow.rotation.y = x > 0 ? -0.22 : 0.22;
      house.add(glassGlow);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.035, 0.02), toonMaterial(0xb8705e));
      crossH.position.copy(windowFrame.position).setZ(1.59);
      house.add(crossH);
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.56, 0.02), toonMaterial(0xb8705e));
      crossV.position.copy(windowFrame.position).setZ(1.59);
      house.add(crossV);
    }

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.9, 0.34), toonMaterial(0xd9a58c));
    chimney.position.set(0.95, 3.1, -0.6);
    chimney.rotation.z = -0.06;
    chimney.castShadow = true;
    outlined(chimney, 1.05);
    house.add(chimney);

    const smoke = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xfffaf2, transparent: true, opacity: 0.5 })
    );
    smoke.position.set(1.05, 3.75, -0.62);
    house.add(smoke);

    const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.5), toonMaterial(0xe9d8ba));
    step.position.set(0, 0.07, 2.0);
    step.receiveShadow = true;
    outlined(step, 1.03);
    house.add(step);

    const doorLight = new THREE.PointLight(0xffc98a, 0, 5.5, 2);
    doorLight.position.set(0, 1.9, 2.1);
    doorLight.userData.night = true;
    house.add(doorLight);
    this.nightLights.push(doorLight);
  }

  private nightLights: THREE.PointLight[] = [];

  private buildGarden(): void {
    const garden = new THREE.Group();
    garden.position.copy(this.landmarks.garden);
    garden.rotation.y = 0.28;
    this.group.add(garden);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.55, 0.16, 18),
      toonMaterial(0xb98d6d)
    );
    soil.position.y = 0.05;
    soil.receiveShadow = true;
    garden.add(soil);

    for (let row = -1; row <= 1; row += 1) {
      const furrow = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.05, 0.32), toonMaterial(0xa87c5d));
      furrow.position.set(0, 0.14, row * 0.85);
      garden.add(furrow);
    }

    for (let i = 0; i < 14; i += 1) {
      const angle = (i / 14) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.62, 5), toonMaterial(0xf4dfc0));
      post.position.set(Math.cos(angle) * 2.85, 0.31, Math.sin(angle) * 2.85);
      garden.add(post);
    }

    const fenceRail = new THREE.Mesh(
      new THREE.TorusGeometry(2.85, 0.032, 5, 44),
      toonMaterial(0xf4dfc0)
    );
    fenceRail.rotation.x = Math.PI / 2;
    fenceRail.position.y = 0.45;
    garden.add(fenceRail);

        this.gardenGroup = garden;
  }

      private gardenGroup: THREE.Group | null = null;

  private buildTrees(): void {
    for (const placement of TREES) {
        const tree = buildTree(placement.scale * 1.45, placement.variant);
      tree.position.set(placement.x, 0, placement.z);
      tree.rotation.y = placement.x * 0.4 + placement.z * 0.2;
      this.group.add(tree);
      this.treePivots.push(tree);
      this.colliders.push({ x: placement.x, z: placement.z, radius: 0.5 * placement.scale });
      }
    }

  private buildGrass(): void {
    const geometry = new THREE.ConeGeometry(0.075, 0.42, 4);
    const material = new THREE.MeshToonMaterial({ color: 0xa4c489 });
    const count = 460;
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    instanced.receiveShadow = false;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();

    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 8) {
      guard += 1;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * (ISLAND.radius - 0.8);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (this.isOnPath(x, z) || this.isInPond(x, z, 0.9)) continue;
      if (Math.hypot(x - this.landmarks.garden.x, z - this.landmarks.garden.z) < 3.1) continue;
      if (Math.hypot(x - this.landmarks.home.x, z - this.landmarks.home.z) < 2.4) continue;

      position.set(x, 0.16, z);
      euler.set((Math.random() - 0.5) * 0.24, Math.random() * Math.PI, (Math.random() - 0.5) * 0.24);
      quaternion.setFromEuler(euler);
      const size = 0.62 + Math.random() * 0.75;
      scale.set(size, size * (0.8 + Math.random() * 0.6), size);
      matrix.compose(position, quaternion, scale);
      instanced.setMatrixAt(placed, matrix);
      color.setHSL(0.24 + Math.random() * 0.05, 0.32, 0.6 + Math.random() * 0.1);
      instanced.setColorAt(placed, color);
      placed += 1;
    }

    instanced.count = placed;
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    this.group.add(instanced);
  }

  private buildFlowers(): void {
    const palette = [0xf8cdd6, 0xf7d59a, 0xe7c7e8, 0xfffaf2, 0xf0a9b8, 0xf2b8a0];
    const stemGeometry = new THREE.CylinderGeometry(0.018, 0.022, 0.36, 4);
    const bloomGeometry = new THREE.SphereGeometry(0.085, 8, 6);
    const stemMaterial = new THREE.MeshToonMaterial({ color: 0x87a86f });
    const bloomMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });

    const spots: Array<[number, number]> = [];
    for (let i = 0; i < 26; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.4 + Math.random() * 8.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (this.isOnPath(x, z, 1.1) || this.isInPond(x, z, 1.4)) continue;
      spots.push([x, z]);
    }

    const cluster = 4;
    const total = spots.length * cluster;
    const stems = new THREE.InstancedMesh(stemGeometry, stemMaterial, total);
    const blooms = new THREE.InstancedMesh(bloomGeometry, bloomMaterial, total);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();

    let index = 0;
    for (const [x, z] of spots) {
      for (let i = 0; i < cluster; i += 1) {
        const offsetX = x + (Math.random() - 0.5) * 0.7;
        const offsetZ = z + (Math.random() - 0.5) * 0.7;
        const height = 0.24 + Math.random() * 0.22;

        position.set(offsetX, height * 0.5, offsetZ);
        scale.set(1, height / 0.36, 1);
        quaternion.identity();
        matrix.compose(position, quaternion, scale);
        stems.setMatrixAt(index, matrix);

        position.set(offsetX, height + 0.03, offsetZ);
        const bloomScale = 0.8 + Math.random() * 0.7;
        scale.set(bloomScale, bloomScale * 0.72, bloomScale);
        matrix.compose(position, quaternion, scale);
        blooms.setMatrixAt(index, matrix);
        color.set(palette[Math.floor(Math.random() * palette.length)]);
        blooms.setColorAt(index, color);
        index += 1;
      }
    }

    stems.instanceMatrix.needsUpdate = true;
    blooms.instanceMatrix.needsUpdate = true;
    if (blooms.instanceColor) blooms.instanceColor.needsUpdate = true;
    this.group.add(stems, blooms);
  }

  private buildProps(): void {
    const bench = buildBench();
    bench.position.copy(this.landmarks.bench);
    bench.rotation.y = Math.PI * 0.62;
    this.group.add(bench);
    this.colliders.push({ x: this.landmarks.bench.x, z: this.landmarks.bench.z, radius: 0.8 });

    const lanternSpots: Array<[number, number]> = [
      [-2.6, 0.4],
      [2.4, 5.0],
      [-4.6, 4.6],
      [7.0, -2.6],
      [-8.4, -2.4]
    ];
    for (const [x, z] of lanternSpots) {
      const { group, glow } = buildLantern();
      group.position.set(x, 0, z);
      group.rotation.y = Math.atan2(-x, -z);
      this.group.add(group);
      const light = new THREE.PointLight(0xffc98a, 0, 6, 2);
      light.position.set(x, 1.35, z);
      this.group.add(light);
      this.nightLights.push(light);
      glow.userData.night = true;
      this.colliders.push({ x, z, radius: 0.3 });
    }

    const sign = buildSign(makeSignTexture());
    sign.position.set(-1.5, 0, 4.2);
    sign.rotation.y = 0.22;
    this.group.add(sign);
    this.colliders.push({ x: -1.5, z: 4.2, radius: 0.4 });

    for (let i = 0; i < 9; i += 1) {
      const stone = buildSteppingStone(0.34 + Math.random() * 0.14);
      stone.position.set(
        this.landmarks.home.x + 2.2 + i * 0.42,
        0.02,
        this.landmarks.home.z + 2.4 + Math.sin(i * 0.8) * 0.5
      );
      this.group.add(stone);
    }

    const bushSpots: Array<[number, number, number]> = [
      [-4.2, -7.6, 1.0],
      [1.2, -4.6, 0.8],
      [-11.6, 6.8, 1.1],
      [8.8, 7.4, 0.9],
      [3.4, 8.6, 0.75],
      [-6.8, 7.2, 0.85],
      [10.4, -5.4, 0.95]
    ];
    for (const [x, z, scale] of bushSpots) {
      const bush = buildBush(scale);
      bush.position.set(x, 0, z);
      bush.rotation.y = Math.random() * Math.PI;
      this.group.add(bush);
      this.colliders.push({ x, z, radius: 0.5 * scale });
    }

    for (let i = 0; i < 14; i += 1) {
      const angle = (i / 14) * Math.PI * 2 + 0.3;
      const rock = buildRock(0.6 + Math.random() * 0.5);
      rock.position.set(
        Math.cos(angle) * (ISLAND.radius - 0.5),
        0.02,
        Math.sin(angle) * (ISLAND.radius - 0.5)
      );
      rock.rotation.y = angle;
      this.group.add(rock);
    }
  }

  private buildShore(): void {
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const reed = new THREE.Group();
      for (let j = 0; j < 3; j += 1) {
        const blade = new THREE.Mesh(
          new THREE.ConeGeometry(0.035, 0.7 + Math.random() * 0.5, 4),
          toonMaterial(0x8fae78)
        );
        blade.position.set((Math.random() - 0.5) * 0.2, 0.4, (Math.random() - 0.5) * 0.2);
        blade.rotation.z = (Math.random() - 0.5) * 0.3;
        reed.add(blade);
      }
      reed.position.set(Math.cos(angle) * (ISLAND.radius - 0.35), 0, Math.sin(angle) * (ISLAND.radius - 0.35));
      this.group.add(reed);
    }
  }

  private buildFireflies(): { points: THREE.Points; material: THREE.PointsMaterial } {
    const count = 70;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 11;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.4 + Math.random() * 2.6;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xfff0b0,
      size: 0.16,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geometry, material);
    this.group.add(points);
    return { points, material };
  }

  isInPond(x: number, z: number, padding = 0): boolean {
    return (
      Math.hypot(x - this.waterCenter.x, z - this.waterCenter.z) <
      this.waterRadius + padding
    );
  }

  isOnPath(x: number, z: number, tolerance = 0): boolean {
    const pathPoints: Array<[number, number]> = [
      [0, 1.8],
      [-2, 0],
      [-4, -1.8],
      [-6.4, -3.6],
      [5.4, 8],
      [4.4, 5],
      [1.5, 2.4],
      [-8, 4.2],
      [-5, 2.1]
    ];
    for (const [px, pz] of pathPoints) {
      if (Math.hypot(x - px, z - pz) < 0.9 + tolerance) return true;
    }
    return false;
  }

  /** Keeps a position on solid ground: inside the island and out of the pond. */
  clampPosition(position: THREE.Vector3, radius = 0.35): void {
    const limit = ISLAND.walkRadius - radius;
    const length = Math.hypot(position.x, position.z);
    if (length > limit) {
      const scale = limit / length;
      position.x *= scale;
      position.z *= scale;
    }

    if (this.isInPond(position.x, position.z, radius * 0.5)) {
      const dx = position.x - this.waterCenter.x;
      const dz = position.z - this.waterCenter.z;
      const distance = Math.hypot(dx, dz) || 1;
      const push = this.waterRadius + radius * 0.5 + 0.05;
      position.x = this.waterCenter.x + (dx / distance) * push;
      position.z = this.waterCenter.z + (dz / distance) * push;
    }

    for (const collider of this.colliders) {
      const dx = position.x - collider.x;
      const dz = position.z - collider.z;
      const distance = Math.hypot(dx, dz);
      const min = collider.radius + radius;
      if (distance > 0.0001 && distance < min) {
        position.x = collider.x + (dx / distance) * min;
        position.z = collider.z + (dz / distance) * min;
      }
    }
  }

  update(dt: number, time: number): void {
    this.waterTexture.offset.x = time * 0.016;
    this.waterTexture.offset.y = Math.sin(time * 0.32) * 0.03;
    this.waterOverlay.position.y = -0.105 + Math.sin(time * 1.1) * 0.008;

    this.treePivots.forEach((tree, index) => {
      tree.rotation.z = Math.sin(time * 0.7 + index) * 0.012;
    });

    const positions = this.fireflies.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i += 1) {
      const y = positions.getY(i);
      positions.setY(i, y + Math.sin(time * 1.4 + i) * dt * 0.14);
      if (positions.getY(i) > 3.1) positions.setY(i, 0.4);
      if (positions.getY(i) < 0.3) positions.setY(i, 0.6);
    }
    positions.needsUpdate = true;
  }

  setFireflyAmount(amount: number): void {
    this.fireflyMaterial.opacity = amount * 0.9;
    this.fireflies.visible = amount > 0.02;
  }

  setNightLightIntensity(amount: number): void {
    for (const light of this.nightLights) {
      light.intensity = amount * 9;
    }
  }

    getGroundMesh(): THREE.Mesh {
      return this.groundMesh;
    }

    getPondMesh(): THREE.Mesh {
      return this.pondSurface;
    }

    getGardenGroup(): THREE.Group | null {
      return this.gardenGroup;
    }

    /** Nearest walkable spot on the pond bank, used to walk over and fish. */
    shorePointNear(position: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
      const dx = position.x - this.waterCenter.x;
      const dz = position.z - this.waterCenter.z;
      const length = Math.hypot(dx, dz) || 1;
      const radius = this.waterRadius + 1.35;
      return out.set(
        this.waterCenter.x + (dx / length) * radius,
        0,
        this.waterCenter.z + (dz / length) * radius
      );
    }

  getGlowMeshes(): THREE.Mesh[] {
    const result: THREE.Mesh[] = [];
    this.group.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.userData.night) result.push(mesh);
    });
    return result;
  }
}

function makeRippleTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      const y = 12 + i * 26;
      for (let x = 0; x <= size; x += 8) {
        const wave = Math.sin((x / size) * Math.PI * 2 + i) * 5;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = '#5c3a30';
    ctx.textAlign = 'center';
    ctx.font = 'italic 74px Georgia, serif';
    ctx.fillText('Our Love', 256, 108);
    ctx.font = 'italic 74px Georgia, serif';
    ctx.fillText('Garden', 256, 192);
    ctx.strokeStyle = 'rgba(74, 31, 26, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, 214);
    ctx.lineTo(372, 214);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}