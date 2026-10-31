import * as THREE from 'three';
import { ISLAND } from '../data/config';
import { ZONES, zoneById, type ZoneId } from '../data/zones';
import { outlined, toonMaterial } from '../entities/toon';
import {
  buildBeachDistrict,
  buildBridgeAndIslet,
  buildCave,
  buildDockAndBoat,
  buildForestGrove,
  buildHillDistrict,
  buildHouseDistrict,
  buildMiniPond,
  buildPlaza,
  buildSpotMarkers,
  buildStatues,
  buildWindmill
} from './districts';
import { buildLantern, buildSteppingStone } from './props';
import type { Collider, DistrictPiece } from './types';

const GRASS = 0xaccb90;
const GRASS_DARK = 0x8fb079;
const SOIL = 0xc9a483;
const SAND = 0xefdfc1;
const ROCK_BASE = 0xcdbca6;
const WATER = 0x9fd3d0;
const WATER_DEEP = 0x7bbcbf;
const SEA = 0xa8d7d4;
const SEA_DEEP = 0x8ec6c7;

export interface Landmarks {
  plaza: THREE.Vector3;
  home: THREE.Vector3;
  garden: THREE.Vector3;
  pond: THREE.Vector3;
  dock: THREE.Vector3;
  bench: THREE.Vector3;
  forest: THREE.Vector3;
  hill: THREE.Vector3;
  beach: THREE.Vector3;
  cave: THREE.Vector3;
  islet: THREE.Vector3;
  center: THREE.Vector3;
}

const ISLET = { x: 37, z: 11, radius: 3.2 };
const BRIDGE = { ax: 31.4, az: 9.4, bx: 35.2, bz: 11.2, half: 1.05 };
const DOCK = { minX: -1.2, maxX: 1.2, minZ: -13.1, maxZ: -8.1 };

const DISTRICT_EXCLUSIONS: Array<{ x: number; z: number; radius: number }> = [
  { x: 0, z: 2, radius: 6.4 },
  { x: -11, z: -1, radius: 5.2 },
  { x: 9, z: 2, radius: 6 },
  { x: 16, z: -2, radius: 3.4 },
  { x: 0, z: -16, radius: 10 },
  { x: -16, z: 10, radius: 7.4 },
  { x: 13, z: 15, radius: 7 },
  { x: 25, z: 3, radius: 8.6 },
  { x: -21, z: -13, radius: 7 },
  { x: -14.5, z: 2.5, radius: 3 },
  { x: 37, z: 11, radius: 5 },
  { x: 0, z: -10, radius: 4 }
];

export class Island {
  readonly group = new THREE.Group();
  readonly landmarks: Landmarks = {
    plaza: new THREE.Vector3(0, 0, 2),
    home: new THREE.Vector3(-11, 0, -1),
    garden: new THREE.Vector3(9, 0, 2),
    pond: new THREE.Vector3(0, 0, -16),
    dock: new THREE.Vector3(0, 0, -9),
    bench: new THREE.Vector3(15.5, 0, 12.2),
    forest: new THREE.Vector3(-16, 0, 10),
    hill: new THREE.Vector3(13, 0, 15),
    beach: new THREE.Vector3(25, 0, 3),
    cave: new THREE.Vector3(-21, 0, -13),
    islet: new THREE.Vector3(ISLET.x, 0, ISLET.z),
    center: new THREE.Vector3(0, 0, 2)
  };
  readonly colliders: Collider[] = [];
    private decorColliders: Collider[] = [];
    readonly waterCenter = new THREE.Vector3(0, 0, -16);
    readonly waterRadius = 7.3;

  private readonly waterTexture: THREE.Texture;
  private readonly waterOverlay: THREE.Mesh;
  private lakeSurface!: THREE.Mesh;
  private groundMesh!: THREE.Mesh;
  private readonly fireflies: THREE.Points;
  private readonly fireflyMaterial: THREE.PointsMaterial;
  private readonly nightLights: THREE.PointLight[] = [];
  private readonly districts: DistrictPiece[] = [];
  private readonly spotMarkers = new Map<string, THREE.Group>();
  private caveLocked = true;
  private readonly butterflies: Array<{ group: THREE.Group; wings: THREE.Mesh[]; phase: number; center: THREE.Vector3 }> = [];

  constructor() {
    this.buildGround();
    this.buildSea();
    this.buildPaths();
    this.buildLake();
    this.waterTexture = makeRippleTexture();
    this.waterOverlay = this.buildWaterOverlay();
    this.buildGardenFence();
    this.buildDistricts();
    this.buildVegetation();
    this.buildFlowers();
    this.buildShoreReeds();
    this.buildButterflies();

    const fireflies = this.buildFireflies();
    this.fireflies = fireflies.points;
    this.fireflyMaterial = fireflies.material;

    this.buildSpotMarkers();
    this.buildNightLights();
  }

  private buildGround(): void {
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.radius, ISLAND.radius * 0.985, 0.5, 72),
      toonMaterial(GRASS)
    );
    top.position.y = -0.25;
    top.receiveShadow = true;
    this.group.add(top);
    this.groundMesh = top;

    const beach = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.radius * 1.015, ISLAND.radius * 0.99, 0.26, 72),
      toonMaterial(SAND)
    );
    beach.position.y = -0.45;
    beach.receiveShadow = true;
    this.group.add(beach);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND.radius * 0.985, ISLAND.radius * 0.8, 1.4, 60),
      toonMaterial(SOIL)
    );
    soil.position.y = -1.15;
    this.group.add(soil);

    const base = new THREE.Mesh(
      new THREE.ConeGeometry(ISLAND.radius * 0.78, 6, 48),
      toonMaterial(ROCK_BASE)
    );
    base.position.y = -4.9;
    base.rotation.y = Math.PI / 12;
    this.group.add(base);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ISLAND.radius * 0.995, 0.16, 8, 90),
      toonMaterial(GRASS_DARK)
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.02;
    this.group.add(rim);
  }

  private buildSea(): void {
    const deep = new THREE.Mesh(
      new THREE.CircleGeometry(150, 72),
      new THREE.MeshToonMaterial({ color: SEA_DEEP })
    );
    deep.rotation.x = -Math.PI / 2;
    deep.position.y = -1.55;
    this.group.add(deep);

    const surface = new THREE.Mesh(
      new THREE.CircleGeometry(148, 72),
      new THREE.MeshToonMaterial({ color: SEA, transparent: true, opacity: 0.75 })
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = -1.3;
    this.group.add(surface);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(ISLAND.radius + 1.2, 0.42, 6, 80),
      new THREE.MeshToonMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.24;
    this.group.add(ring);
  }

  private buildPaths(): void {
    const routes: Array<Array<{ x: number; z: number }>> = [
      [{ x: 0, z: 2 }, { x: 5.2, z: 2.1 }, { x: 7.2, z: 2.2 }],
      [{ x: 0, z: 2 }, { x: -5, z: 1.4 }, { x: -8.4, z: 0.8 }],
      [{ x: 0, z: 2 }, { x: 0, z: -2.4 }, { x: 0, z: -8.2 }],
      [{ x: 0, z: 2 }, { x: -5.2, z: 4.6 }, { x: -10.4, z: 7.6 }, { x: -12.6, z: 8.6 }],
      [{ x: 0, z: 2 }, { x: 5.6, z: 6.2 }, { x: 9.6, z: 10.4 }, { x: 11.2, z: 12 }],
      [{ x: 0, z: 2 }, { x: 8, z: 3 }, { x: 15, z: 3 }, { x: 20.6, z: 2.6 }],
      [{ x: 0, z: 2 }, { x: -12.2, z: -4.6 }, { x: -17.4, z: -9 }]
    ];

    const points: Array<{ x: number; z: number; size: number }> = [];
    for (const route of routes) {
      for (let i = 0; i < route.length - 1; i += 1) {
        const a = route[i];
        const b = route[i + 1];
        const distance = Math.hypot(b.x - a.x, b.z - a.z);
        const steps = Math.max(1, Math.round(distance / 1.15));
        for (let step = 0; step < steps; step += 1) {
          const t = step / steps;
          points.push({
            x: a.x + (b.x - a.x) * t,
            z: a.z + (b.z - a.z) * t,
            size: 0.55 + Math.random() * 0.18
          });
        }
      }
    }

    const material = new THREE.MeshToonMaterial({ color: 0xe9d8ba });
    const instanced = new THREE.InstancedMesh(
      new THREE.CircleGeometry(1, 12),
      material,
      points.length
    );
    instanced.receiveShadow = true;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    points.forEach((point, index) => {
      matrix.compose(
        new THREE.Vector3(point.x, 0.012, point.z),
        quaternion,
        new THREE.Vector3(point.size * 0.95, point.size * 0.8, 1)
      );
      instanced.setMatrixAt(index, matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    this.group.add(instanced);
  }

  private buildLake(): void {
    const basin = new THREE.Mesh(
      new THREE.CircleGeometry(this.waterRadius * 1.2, 48),
      toonMaterial(SAND)
    );
    basin.rotation.x = -Math.PI / 2;
    basin.position.set(this.waterCenter.x, -0.03, this.waterCenter.z);
    basin.receiveShadow = true;
    this.group.add(basin);

    const deep = new THREE.Mesh(
      new THREE.CircleGeometry(this.waterRadius, 52),
      new THREE.MeshToonMaterial({ color: WATER_DEEP })
    );
    deep.rotation.x = -Math.PI / 2;
    deep.position.set(this.waterCenter.x, -0.34, this.waterCenter.z);
    this.group.add(deep);

    const surface = new THREE.Mesh(
      new THREE.CircleGeometry(this.waterRadius * 1.01, 52),
      new THREE.MeshToonMaterial({ color: WATER, transparent: true, opacity: 0.84 })
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.set(this.waterCenter.x, -0.14, this.waterCenter.z);
    this.group.add(surface);
    this.lakeSurface = surface;

    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * Math.PI * 2 + 0.2;
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5 + (i % 3) * 0.12, 0),
        toonMaterial(0xd8cfc0)
      );
      stone.scale.set(1.1, 0.7, 1);
      stone.position.set(
        this.waterCenter.x + Math.cos(angle) * (this.waterRadius + 0.5),
        0.05,
        this.waterCenter.z + Math.sin(angle) * (this.waterRadius + 0.5)
      );
      stone.rotation.y = angle;
      stone.castShadow = true;
      this.group.add(stone);
    }
  }

  private buildWaterOverlay(): THREE.Mesh {
    this.waterTexture.wrapS = THREE.RepeatWrapping;
    this.waterTexture.wrapT = THREE.RepeatWrapping;
    this.waterTexture.repeat.set(3.2, 3.2);
    const geometry = new THREE.CircleGeometry(this.waterRadius * 0.99, 48);
    const material = new THREE.MeshBasicMaterial({
      map: this.waterTexture,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(this.waterCenter.x, -0.12, this.waterCenter.z);
    this.group.add(mesh);
    return mesh;
  }

  private buildGardenFence(): void {
    const center = this.landmarks.garden;
    const radius = 3.6;
    const group = new THREE.Group();

    const hedge = new THREE.Mesh(
      new THREE.CylinderGeometry(radius + 0.5, radius + 0.5, 0.16, 26),
      toonMaterial(0xb98d6d)
    );
    hedge.position.set(center.x, 0.05, center.z);
    hedge.receiveShadow = true;
    group.add(hedge);

    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      if (Math.abs(angle - Math.PI) < 0.45) continue;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.55, 5),
        toonMaterial(0xf4dfc0)
      );
      post.position.set(
        center.x + Math.cos(angle) * radius,
        0.27,
        center.z + Math.sin(angle) * radius
      );
      group.add(post);
    }

    const rail = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.03, 5, 40, Math.PI * 1.72),
      toonMaterial(0xf4dfc0)
    );
    rail.rotation.x = Math.PI / 2;
    rail.rotation.z = Math.PI * 0.14;
    rail.position.set(center.x, 0.42, center.z);
    group.add(rail);

    this.group.add(group);
  }

  private buildDistricts(): void {
    const pieces: DistrictPiece[] = [
      buildPlaza(),
      buildHouseDistrict(),
      buildWindmill({ x: 16, z: -2 }),
      buildDockAndBoat(),
      buildForestGrove(),
      buildMiniPond(),
      buildHillDistrict(),
      buildBeachDistrict(),
      buildBridgeAndIslet(),
      buildCave(),
      buildStatues()
    ];

    for (const piece of pieces) {
      this.group.add(piece.group);
      if (piece.colliders) this.colliders.push(...piece.colliders);
      this.districts.push(piece);
    }
  }

  private buildVegetation(): void {
    this.scatterTrees();
    this.scatterBushes();
    this.scatterRocks();
    this.scatterGrass();
  }

  private scatterTrees(): void {
    const placements = this.samplePoints(72, 2.6, 30.5, 7);
    const trunkGeometry = new THREE.CylinderGeometry(0.16, 0.26, 1.4, 6);
    const trunkMaterial = toonMaterial(0xa97a5a);
    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, placements.length);

    const foliageGeometry = new THREE.SphereGeometry(1, 12, 9);
    const foliageMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
    const lower = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, placements.length);
    const upper = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, placements.length);
    const side = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, placements.length);

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const color = new THREE.Color();
    const palettes = [0x9dbe86, 0x86ab74, 0xb6cd9a];

    placements.forEach((point, index) => {
      const scale = 0.9 + point.random * 0.9;
      quaternion.setFromEuler(new THREE.Euler(0, point.random * Math.PI * 2, 0));

      matrix.compose(
        new THREE.Vector3(point.x, 0.7 * scale, point.z),
        quaternion,
        new THREE.Vector3(scale, scale, scale)
      );
      trunks.setMatrixAt(index, matrix);

      const base = palettes[index % palettes.length];
      color.setHex(base);
      lower.setColorAt(index, color);
      upper.setColorAt(index, color.clone().offsetHSL(0.015, 0, 0.04));
      side.setColorAt(index, color.clone().offsetHSL(-0.01, 0, -0.03));

      matrix.compose(
        new THREE.Vector3(point.x, 1.9 * scale, point.z),
        quaternion,
        new THREE.Vector3(1.1 * scale, 0.95 * scale, 1.1 * scale)
      );
      lower.setMatrixAt(index, matrix);

      matrix.compose(
        new THREE.Vector3(point.x, 2.6 * scale, point.z),
        quaternion,
        new THREE.Vector3(0.8 * scale, 0.75 * scale, 0.8 * scale)
      );
      upper.setMatrixAt(index, matrix);

      matrix.compose(
        new THREE.Vector3(point.x + 0.55 * scale, 1.75 * scale, point.z + 0.2 * scale),
        quaternion,
        new THREE.Vector3(0.62 * scale, 0.6 * scale, 0.62 * scale)
      );
      side.setMatrixAt(index, matrix);

      this.colliders.push({ x: point.x, z: point.z, radius: 0.5 * scale });
    });

    for (const mesh of [trunks, lower, upper, side]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.group.add(mesh);
          }
        }

  private scatterBushes(): void {
    const placements = this.samplePoints(48, 1.8, 30, 4);
    const geometry = new THREE.SphereGeometry(1, 10, 8);
    const material = new THREE.MeshToonMaterial({ color: 0xffffff });
    const instanced = new THREE.InstancedMesh(geometry, material, placements.length);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    placements.forEach((point, index) => {
      const scale = 0.34 + point.random * 0.26;
      matrix.compose(
        new THREE.Vector3(point.x, scale * 0.72, point.z),
        new THREE.Quaternion(),
        new THREE.Vector3(scale * 1.25, scale * 0.85, scale * 1.25)
      );
      instanced.setMatrixAt(index, matrix);
      color.setHex(index % 3 === 0 ? 0x86ab74 : 0x9dbe86);
      instanced.setColorAt(index, color);
    });

    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    instanced.castShadow = true;
    this.group.add(instanced);
  }

  private scatterRocks(): void {
    const placements = this.samplePoints(44, 1.4, 31.5, 3);
    const geometry = new THREE.DodecahedronGeometry(1, 0);
    const instanced = new THREE.InstancedMesh(geometry, toonMaterial(0xd8cfc0), placements.length);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();

    placements.forEach((point, index) => {
      const scale = 0.28 + point.random * 0.42;
      quaternion.setFromEuler(new THREE.Euler(0, point.random * Math.PI * 2, 0.2));
      matrix.compose(
        new THREE.Vector3(point.x, scale * 0.4, point.z),
        quaternion,
        new THREE.Vector3(scale * 1.2, scale * 0.72, scale)
      );
      instanced.setMatrixAt(index, matrix);
      if (scale > 0.5) {
        this.colliders.push({ x: point.x, z: point.z, radius: scale * 0.8 });
      }
    });

    instanced.instanceMatrix.needsUpdate = true;
    instanced.castShadow = true;
    instanced.receiveShadow = true;
    this.group.add(instanced);
  }

  private scatterGrass(): void {
    const geometry = new THREE.ConeGeometry(0.09, 0.5, 4);
    const material = new THREE.MeshToonMaterial({ color: 0xa4c489 });
    const count = 1500;
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const color = new THREE.Color();

    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 10) {
      guard += 1;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * (ISLAND.walkRadius - 1.6);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (this.isOnPath(x, z, 0.6)) continue;
      if (this.isInPond(x, z, 0.8)) continue;
      if (this.inDistrict(x, z, 3.6)) continue;
      if (this.onIsletOrBridge(x, z)) continue;

      euler.set((Math.random() - 0.5) * 0.24, Math.random() * Math.PI, (Math.random() - 0.5) * 0.24);
      quaternion.setFromEuler(euler);
      const size = 0.6 + Math.random() * 0.85;
      matrix.compose(
        new THREE.Vector3(x, 0.19 * size, z),
        quaternion,
        new THREE.Vector3(size, size * (0.8 + Math.random() * 0.6), size)
      );
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
    const palette = [0xf8cdd6, 0xf7d59a, 0xe7c7e8, 0xfffaf2, 0xf0a9b8, 0xf2b8a0, 0xd8c6ee];
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.026, 0.42, 4);
    const bloomGeometry = new THREE.SphereGeometry(0.1, 8, 6);
    const stemMaterial = new THREE.MeshToonMaterial({ color: 0x87a86f });
    const bloomMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });

    const spots = this.samplePoints(70, 1.2, 31, 6);
    const cluster = 4;
    const total = spots.length * cluster;
    const stems = new THREE.InstancedMesh(stemGeometry, stemMaterial, total);
    const blooms = new THREE.InstancedMesh(bloomGeometry, bloomMaterial, total);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const color = new THREE.Color();

    let index = 0;
    for (const spot of spots) {
      for (let i = 0; i < cluster; i += 1) {
        const x = spot.x + (Math.random() - 0.5) * 0.8;
        const z = spot.z + (Math.random() - 0.5) * 0.8;
        const height = 0.28 + Math.random() * 0.24;

        matrix.compose(
          new THREE.Vector3(x, height * 0.5, z),
          quaternion,
          new THREE.Vector3(1, height / 0.42, 1)
        );
        stems.setMatrixAt(index, matrix);

        const bloomScale = 0.8 + Math.random() * 0.7;
        matrix.compose(
          new THREE.Vector3(x, height + 0.03, z),
          quaternion,
          new THREE.Vector3(bloomScale, bloomScale * 0.72, bloomScale)
        );
        blooms.setMatrixAt(index, matrix);
        color.setHex(palette[Math.floor(Math.random() * palette.length)]);
        blooms.setColorAt(index, color);
        index += 1;
      }
    }

    stems.instanceMatrix.needsUpdate = true;
    blooms.instanceMatrix.needsUpdate = true;
    if (blooms.instanceColor) blooms.instanceColor.needsUpdate = true;
    this.group.add(stems, blooms);
  }

  private buildShoreReeds(): void {
    const geometry = new THREE.ConeGeometry(0.045, 0.9, 4);
    const material = new THREE.MeshToonMaterial({ color: 0x8fae78 });
    const count = 46;
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const radius = ISLAND.radius * 0.965;
      quaternion.setFromEuler(new THREE.Euler(0, angle, (Math.random() - 0.5) * 0.25));
      matrix.compose(
        new THREE.Vector3(Math.cos(angle) * radius, 0.45, Math.sin(angle) * radius),
        quaternion,
        new THREE.Vector3(1, 0.8 + Math.random() * 0.5, 1)
      );
      instanced.setMatrixAt(i, matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
    this.group.add(instanced);
  }

  private buildButterflies(): void {
    const spots = [
      { x: 9, z: 4, color: 0xf7d59a },
      { x: 6.4, z: 0.2, color: 0xf0a9b8 },
      { x: 12.5, z: 5.5, color: 0xe7c7e8 },
      { x: 13.5, z: 13, color: 0xfff1da },
      { x: 10.2, z: 16.4, color: 0xf7d59a },
      { x: -14, z: 8, color: 0xe7c7e8 },
      { x: -17.4, z: 11.6, color: 0xf0a9b8 },
      { x: 22, z: 4.4, color: 0xf7d59a }
    ];

    spots.forEach((spot, index) => {
      const group = new THREE.Group();
      const wingGeometry = new THREE.CircleGeometry(0.12, 8, 0, Math.PI);
      const wings: THREE.Mesh[] = [];
      for (const dir of [-1, 1]) {
        const wing = new THREE.Mesh(
          wingGeometry,
          new THREE.MeshBasicMaterial({ color: spot.color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
        );
        wing.position.x = dir * 0.001;
        wing.rotation.y = (Math.PI / 2) * dir;
        group.add(wing);
        wings.push(wing);
      }
      group.position.set(spot.x, 1.2, spot.z);
      this.group.add(group);
      this.butterflies.push({
        group,
        wings,
        phase: index * 1.3,
        center: new THREE.Vector3(spot.x, 0, spot.z)
      });
    });
  }

  private buildSpotMarkers(): void {
    const { group, markers } = buildSpotMarkers();
    this.group.add(group);
    for (const [id, marker] of markers) this.spotMarkers.set(id, marker);
  }

  private buildNightLights(): void {
    const positions: Array<{ x: number; z: number; color?: number; intensity?: number }> = [
      { x: -4.2, z: 1.2 },
      { x: 4.2, z: 1.2 },
      { x: -11, z: 2.6, intensity: 9 },
      { x: 1.2, z: -12.4, intensity: 8 },
      { x: -16, z: 9, color: 0xbff5e6, intensity: 7 },
      { x: -21, z: -13, color: 0xb69bff, intensity: 8 },
      { x: 37, z: 11, intensity: 7 },
      { x: 26, z: 4.6, intensity: 6 }
    ];

    for (const entry of positions) {
      const light = new THREE.PointLight(entry.color ?? 0xffc98a, 0, 10, 2);
      light.position.set(entry.x, 2.1, entry.z);
      this.group.add(light);
      this.nightLights.push(light);
    }

    for (const [x, z] of [
      [-14, 8],
      [-18, 12.4],
      [-12.4, 11.2]
    ] as const) {
      const lantern = buildLantern(0xffe6a8);
      lantern.group.position.set(x, 0, z);
      lantern.group.scale.setScalar(0.85);
      this.group.add(lantern.group);
      this.colliders.push({ x, z, radius: 0.3 });
    }
  }

  private buildFireflies(): { points: THREE.Points; material: THREE.PointsMaterial } {
    const count = 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      if (i < count * 0.55) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 8;
        positions[i * 3] = -16 + Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0.4 + Math.random() * 2.8;
        positions[i * 3 + 2] = 10 + Math.sin(angle) * radius;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 30;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0.4 + Math.random() * 2.6;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xfff0b0,
      size: 0.18,
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

  private samplePoints(
    count: number,
    minDistance: number,
    maxRadius: number,
    seed: number
  ): Array<{ x: number; z: number; random: number }> {
    const result: Array<{ x: number; z: number; random: number }> = [];
    let guard = 0;
    let seedValue = seed * 9301 + 49297;
    const random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };

    while (result.length < count && guard < count * 40) {
      guard += 1;
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * maxRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (this.isOnPath(x, z, 1)) continue;
      if (this.isInPond(x, z, 1.2)) continue;
      if (this.inDistrict(x, z, 1)) continue;
      if (this.onIsletOrBridge(x, z)) continue;
      if (result.some((point) => Math.hypot(point.x - x, point.z - z) < minDistance)) continue;

      result.push({ x, z, random: random() });
    }

    return result;
  }

  private inDistrict(x: number, z: number, padding = 0): boolean {
    for (const zone of DISTRICT_EXCLUSIONS) {
      if (Math.hypot(x - zone.x, z - zone.z) < zone.radius + padding) return true;
    }
    return false;
  }

  isOnPath(x: number, z: number, tolerance = 0): boolean {
    const pathPoints: Array<[number, number]> = [
      [0, 2],
      [4, 2.1],
      [6.6, 2.2],
      [-4.6, 1.6],
      [-8, 0.8],
      [0, -4],
      [0, -8.2],
      [-4.8, 4.4],
      [-9.4, 7.2],
      [-12.2, 8.4],
      [5, 5.8],
      [9.2, 10],
      [11.2, 12.4],
      [7, 3],
      [14, 3],
      [20, 2.6],
      [-11.4, -4.2],
      [-16.6, -8.6]
    ];
    for (const [px, pz] of pathPoints) {
      if (Math.hypot(x - px, z - pz) < 1.25 + tolerance) return true;
    }
    return false;
  }

  isInPond(x: number, z: number, padding = 0): boolean {
    return (
      Math.hypot(x - this.waterCenter.x, z - this.waterCenter.z) <
      this.waterRadius + padding
    );
  }

  private onIsletOrBridge(x: number, z: number): boolean {
    if (Math.hypot(x - ISLET.x, z - ISLET.z) < ISLET.radius + 0.6) return true;
    return distanceToSegment(x, z, BRIDGE) < BRIDGE.half + 0.8;
  }

  /** True when this position is inside the walkable union (island, dock, bridge, islet). */
  isWalkable(x: number, z: number, radius = 0.3): boolean {
      if (this.onDock(x, z)) return true;
      if (Math.hypot(x, z) <= ISLAND.walkRadius - radius) {
        if (!this.isInPond(x, z, radius * 0.4)) return true;
      }
      if (Math.hypot(x - ISLET.x, z - ISLET.z) <= ISLET.radius - radius * 0.4) return true;
      return distanceToSegment(x, z, BRIDGE) <= BRIDGE.half - radius * 0.5;
    }

    private onDock(x: number, z: number): boolean {
      return x > DOCK.minX && x < DOCK.maxX && z > DOCK.minZ && z < DOCK.maxZ;
    }

    /** Locks the crystal cave until the memory requirement is met. */
    setCaveLocked(locked: boolean): void {
      this.caveLocked = locked;
    }

    /** Points to the current front-yard furniture colliders (rebuilt on sync). */
    setDecorColliders(colliders: Collider[]): void {
      this.decorColliders = colliders;
    }

  /** Keeps a position on solid ground: island, bridge, islet, out of the lake. */
  clampPosition(position: THREE.Vector3, radius = 0.35): void {
    if (!this.isWalkable(position.x, position.z, radius)) {
      const candidates = [
        projectToCircle(position.x, position.z, ISLAND.walkRadius - radius),
        projectToCircle(
          position.x - ISLET.x,
          position.z - ISLET.z,
          Math.max(0.2, ISLET.radius - radius * 0.4)
        ).add(new THREE.Vector3(ISLET.x, 0, ISLET.z)),
        projectToSegment(position.x, position.z, BRIDGE, Math.max(0.2, BRIDGE.half - radius * 0.5))
      ];
      let best = candidates[0];
      let bestDistance = Infinity;
      for (const candidate of candidates) {
        const distance = Math.hypot(candidate.x - position.x, candidate.z - position.z);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = candidate;
        }
      }
      position.x = best.x;
      position.z = best.z;
    }

    if (Math.hypot(position.x, position.z) < ISLAND.walkRadius) {
          if (!this.onDock(position.x, position.z) && this.isInPond(position.x, position.z, radius * 0.5)) {
        const dx = position.x - this.waterCenter.x;
        const dz = position.z - this.waterCenter.z;
        const distance = Math.hypot(dx, dz) || 1;
        const push = this.waterRadius + radius * 0.5 + 0.05;
        position.x = this.waterCenter.x + (dx / distance) * push;
        position.z = this.waterCenter.z + (dz / distance) * push;
      }
    }

        if (this.caveLocked) {
          const caveDistance = Math.hypot(position.x + 21, position.z + 13);
          if (caveDistance < 5.6) {
                    if (caveDistance < 0.001) {
                      position.x = -21 + 5.9;
                      position.z = -13;
                    } else {
                      const scale = 5.9 / caveDistance;
                      position.x = -21 + (position.x + 21) * scale;
                      position.z = -13 + (position.z + 13) * scale;
                    }
                  }
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

        for (const collider of this.decorColliders) {
          const dx = position.x - collider.x;
          const dz = position.z - collider.z;
          const distance = Math.hypot(dx, dz);
          const min = collider.radius + radius;
          if (distance > 0.0001 && distance < min) {
            position.x = collider.x + (dx / distance) * min;
            position.z = collider.z + (dz / distance) * min;
          }
        }

    if (!this.isWalkable(position.x, position.z, radius)) {
      const fallback = projectToCircle(position.x, position.z, ISLAND.walkRadius - radius);
      position.x = fallback.x;
      position.z = fallback.z;
    }
  }

  update(dt: number, time: number): void {
    this.waterTexture.offset.x = time * 0.014;
    this.waterTexture.offset.y = Math.sin(time * 0.28) * 0.03;
    this.waterOverlay.position.y = -0.125 + Math.sin(time * 1.05) * 0.008;
    this.lakeSurface.position.y = -0.14 + Math.sin(time * 0.9) * 0.006;

    for (const district of this.districts) district.update?.(dt, time);

        this.butterflies.forEach((butterfly) => {
      const bob = Math.sin(time * 1.6 + butterfly.phase) * 0.35;
      butterfly.group.position.set(
        butterfly.center.x + Math.cos(time * 0.5 + butterfly.phase) * 1.4,
        1.2 + bob,
        butterfly.center.z + Math.sin(time * 0.42 + butterfly.phase) * 1.4
      );
      butterfly.group.rotation.y = time * 0.8 + butterfly.phase;
      butterfly.wings.forEach((wing, index) => {
        wing.rotation.z = Math.sin(time * 12 + index * Math.PI) * 0.7;
      });
    });

    let markerIndex = 0;
        for (const marker of this.spotMarkers.values()) {
          marker.rotation.y = time * 0.5 + markerIndex;
          const spark = marker.children[1] as THREE.Mesh;
          spark.position.y = 0.55 + Math.sin(time * 2 + markerIndex) * 0.08;
          markerIndex += 1;
        }

    const positions = this.fireflies.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i += 1) {
      const y = positions.getY(i);
      positions.setY(i, y + Math.sin(time * 1.3 + i) * dt * 0.16);
      if (positions.getY(i) > 3.2) positions.setY(i, 0.4);
      if (positions.getY(i) < 0.3) positions.setY(i, 0.7);
    }
    positions.needsUpdate = true;
  }

  setFireflyAmount(amount: number): void {
    this.fireflyMaterial.opacity = amount * 0.9;
    this.fireflies.visible = amount > 0.02;
  }

  setNightLightIntensity(amount: number): void {
    for (const light of this.nightLights) light.intensity = amount * 9;
  }

  setSpotDiscovered(id: string, discovered: boolean): void {
    const marker = this.spotMarkers.get(id);
    if (marker) marker.visible = !discovered;
  }

  hideAllSpotMarkers(): void {
    for (const marker of this.spotMarkers.values()) marker.visible = false;
  }

  getGroundMesh(): THREE.Mesh {
    return this.groundMesh;
  }

  getPondMesh(): THREE.Mesh {
    return this.lakeSurface;
  }

  /** Dock end, handy for fishing and quests later. */
  getDockEnd(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, -12.6);
  }

  /** Nearest walkable spot on the lake bank. */
  shorePointNear(position: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
    const dx = position.x - this.waterCenter.x;
    const dz = position.z - this.waterCenter.z;
    const length = Math.hypot(dx, dz) || 1;
    const radius = this.waterRadius + 1.6;
    return out.set(
      this.waterCenter.x + (dx / length) * radius,
      0,
      this.waterCenter.z + (dz / length) * radius
    );
  }

  /** Zone a point belongs to, used for fast travel buttons and map clicks. */
  zoneAt(x: number, z: number): ZoneId | null {
    let best: ZoneId | null = null;
    let bestDistance = Infinity;
    for (const zone of ZONES) {
      const distance = Math.hypot(x - zone.center.x, z - zone.center.z);
      if (distance <= zone.radius && distance < bestDistance) {
        best = zone.id;
        bestDistance = distance;
      }
    }
    return best;
  }

  zoneDefinition(id: ZoneId) {
    return zoneById(id);
  }
}

function projectToCircle(x: number, z: number, radius: number): THREE.Vector3 {
  const length = Math.hypot(x, z);
  if (length < 0.0001) return new THREE.Vector3(radius, 0, 0);
  if (length <= radius) return new THREE.Vector3(x, 0, z);
  return new THREE.Vector3((x / length) * radius, 0, (z / length) * radius);
}

function projectToSegment(
  x: number,
  z: number,
  segment: { ax: number; az: number; bx: number; bz: number; half: number },
  half: number
): THREE.Vector3 {
  const dx = segment.bx - segment.ax;
  const dz = segment.bz - segment.az;
  const lengthSq = dx * dx + dz * dz || 1;
  let t = ((x - segment.ax) * dx + (z - segment.az) * dz) / lengthSq;
  t = Math.min(1, Math.max(0, t));
  const px = segment.ax + dx * t;
  const pz = segment.az + dz * t;
  const offsetX = x - px;
  const offsetZ = z - pz;
  const distance = Math.hypot(offsetX, offsetZ) || 1;
  const clamped = Math.min(distance, half);
  return new THREE.Vector3(px + (offsetX / distance) * clamped, 0, pz + (offsetZ / distance) * clamped);
}

function distanceToSegment(
  x: number,
  z: number,
  segment: { ax: number; az: number; bx: number; bz: number }
): number {
  const dx = segment.bx - segment.ax;
  const dz = segment.bz - segment.az;
  const lengthSq = dx * dx + dz * dz || 1;
  let t = ((x - segment.ax) * dx + (z - segment.az) * dz) / lengthSq;
  t = Math.min(1, Math.max(0, t));
  return Math.hypot(x - (segment.ax + dx * t), z - (segment.az + dz * t));
}

function makeRippleTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
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

export function buildSteppingStones(count: number): THREE.Object3D[] {
  const stones: THREE.Object3D[] = [];
  for (let i = 0; i < count; i += 1) {
    const stone = buildSteppingStone(0.3 + Math.random() * 0.16);
    stones.push(stone);
  }
  return stones;
}

export { outlined };