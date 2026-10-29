import * as THREE from 'three';
import { outlined, sphereGeometry, toonMaterial } from './toon';

const INK = 0x3b1a15;
const CAT_ORANGE = 0xe8a86a;
const CAT_CREAM = 0xfff1da;
const CHICK_YELLOW = 0xf7d06a;
const BEAK = 0xe08a4b;
const BOWL_WATER = 0x9fd3d0;
const BOWL_GLASS = 0xdcf1f4;

export interface AnimalActor {
  readonly id: string;
  readonly root: THREE.Group;
  update(dt: number, time: number, player: THREE.Vector3, active: boolean): void;
  react(): void;
  setVisible(visible: boolean): void;
  getHeadPosition(out?: THREE.Vector3): THREE.Vector3;
  hits(object: THREE.Object3D): boolean;
}

abstract class BaseAnimal implements AnimalActor {
  readonly id: string;
  readonly root = new THREE.Group();
  protected readonly pivot = new THREE.Group();
  protected hop = 0;
  protected phase = Math.random() * Math.PI * 2;
  protected reaction = 0;
  protected facing = 0;

  constructor(id: string) {
    this.id = id;
    this.root.add(this.pivot);
  }

  abstract update(dt: number, time: number, player: THREE.Vector3, active: boolean): void;

  react(): void {
    this.reaction = 1;
  }

  setVisible(visible: boolean): void {
    this.root.visible = visible;
  }

  getHeadPosition(out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(this.root.position).setY(this.root.position.y + 0.75);
  }

  hits(object: THREE.Object3D): boolean {
    let node: THREE.Object3D | null = object;
    while (node) {
      if (node === this.root) return true;
      node = node.parent;
    }
    return false;
  }

  protected applySquash(time: number, moving: number): void {
    if (this.reaction > 0) this.reaction = Math.max(0, this.reaction - 0.045);
    const pop = Math.sin((1 - this.reaction) * Math.PI) * (this.reaction > 0 ? 0.22 : 0);
    const hopHeight = Math.abs(Math.sin(this.hop)) * moving;
    this.pivot.position.y = hopHeight * 0.13;
    const squash = 1 + (hopHeight - 0.4) * 0.1 * moving + pop;
    this.pivot.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    this.pivot.scale.y *= 1 + Math.sin(time * 1.9 + this.phase) * 0.014;
  }

  protected faceMovement(moveX: number, moveZ: number, dt: number): void {
    if (Math.abs(moveX) + Math.abs(moveZ) < 0.001) return;
    const target = Math.atan2(moveX, moveZ);
    let difference = (target - this.facing) % (Math.PI * 2);
    if (difference > Math.PI) difference -= Math.PI * 2;
    if (difference < -Math.PI) difference += Math.PI * 2;
    this.facing += difference * (1 - Math.exp(-9 * dt));
    this.root.rotation.y = this.facing;
  }
}

export class Cimoy extends BaseAnimal {
  private readonly tail = new THREE.Group();
  private readonly ears: THREE.Group[] = [];

  constructor() {
    super('cimoy');
    this.build();
    this.hop = 0;
  }

  private build(): void {
    const body = new THREE.Mesh(sphereGeometry(0.29, 18), toonMaterial(CAT_ORANGE));
    body.scale.set(1, 0.88, 1.25);
    body.position.y = 0.34;
    body.castShadow = true;
    outlined(body, 1.05);
    this.pivot.add(body);

    const chest = new THREE.Mesh(sphereGeometry(0.17, 14), toonMaterial(CAT_CREAM));
    chest.scale.set(1, 0.9, 0.55);
    chest.position.set(0, 0.28, 0.24);
    this.pivot.add(chest);

    const head = new THREE.Group();
    head.position.set(0, 0.62, 0.2);
    this.pivot.add(head);

    const skull = new THREE.Mesh(sphereGeometry(0.25, 18), toonMaterial(CAT_ORANGE));
    skull.castShadow = true;
    outlined(skull, 1.05);
    head.add(skull);

    const muzzle = new THREE.Mesh(sphereGeometry(0.11, 12), toonMaterial(CAT_CREAM));
    muzzle.scale.set(1.25, 0.8, 0.7);
    muzzle.position.set(0, -0.08, 0.19);
    head.add(muzzle);

    for (const dir of [-1, 1]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 8, 6),
        new THREE.MeshBasicMaterial({ color: INK })
      );
      eye.position.set(dir * 0.1, 0.03, 0.21);
      eye.scale.set(1, 1.15, 0.6);
      head.add(eye);

      const cheek = new THREE.Mesh(
        new THREE.CircleGeometry(0.048, 12),
        new THREE.MeshBasicMaterial({ color: 0xf7b5b0, transparent: true, opacity: 0.6, depthWrite: false })
      );
      cheek.position.set(dir * 0.16, -0.06, 0.2);
      head.add(cheek);
    }

    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.045, 4),
      new THREE.MeshBasicMaterial({ color: 0xc9736f })
    );
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.045, 0.29);
    head.add(nose);

    const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0x8a6152, transparent: true, opacity: 0.7 });
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 2; i += 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(dir * 0.06, -0.06 + i * 0.02, 0.26),
          new THREE.Vector3(dir * 0.26, -0.04 + i * 0.05, 0.22)
        ]);
        head.add(new THREE.Line(geometry, whiskerMaterial));
      }
    }

    for (const dir of [-1, 1]) {
      const ear = new THREE.Group();
      ear.position.set(dir * 0.16, 0.19, 0);
      ear.rotation.z = dir * 0.28;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.17, 4), toonMaterial(CAT_ORANGE));
      cone.position.y = 0.06;
      cone.castShadow = true;
      outlined(cone, 1.06);
      ear.add(cone);
      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 4), toonMaterial(0xf2b8a0));
      inner.position.set(0, 0.05, 0.03);
      ear.add(inner);
      head.add(ear);
      this.ears.push(ear);
    }

    for (const [x, z] of [
      [-0.15, 0.2],
      [0.15, 0.2],
      [-0.15, -0.2],
      [0.15, -0.2]
    ] as const) {
      const leg = new THREE.Mesh(sphereGeometry(0.085, 10), toonMaterial(CAT_CREAM));
      leg.scale.set(1, 1.2, 1);
      leg.position.set(x, 0.11, z);
      leg.castShadow = true;
      this.pivot.add(leg);
    }

    this.tail.position.set(0, 0.4, -0.32);
    const tailCurve = new THREE.TorusGeometry(0.2, 0.045, 6, 14, Math.PI * 1.2);
    const tailMesh = new THREE.Mesh(tailCurve, toonMaterial(CAT_ORANGE));
    tailMesh.rotation.y = Math.PI / 2;
    tailMesh.rotation.x = 0.3;
    outlined(tailMesh, 1.07);
    this.tail.add(tailMesh);
    this.pivot.add(this.tail);

    for (let i = 0; i < 3; i += 1) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.03, 0.05),
        toonMaterial(0xc98a4f)
      );
      stripe.position.set(0, 0.53 - i * 0.06, -0.03 + i * 0.08);
      this.pivot.add(stripe);
    }
  }

  update(dt: number, time: number, player: THREE.Vector3, active: boolean): void {
    const distance = Math.hypot(player.x - this.root.position.x, player.z - this.root.position.z);
    let moving = 0;

    if (active && distance > 2.4 && distance < 14) {
      const dx = player.x - this.root.position.x;
      const dz = player.z - this.root.position.z;
      const length = Math.hypot(dx, dz) || 1;
      const speed = distance > 5 ? 3.1 : 2.1;
      this.root.position.x += (dx / length) * speed * dt;
      this.root.position.z += (dz / length) * speed * dt;
      this.faceMovement(dx, dz, dt);
      this.hop += dt * 9;
      moving = 1;
    } else {
      this.hop = THREE.MathUtils.damp(this.hop % (Math.PI * 2), 0, 6, dt);
      if (active) this.faceMovement(player.x - this.root.position.x, player.z - this.root.position.z, dt * 0.4);
    }

    this.tail.rotation.z = Math.sin(time * 2.6 + this.phase) * 0.35 + (moving ? 0.25 : 0);
    this.ears.forEach((ear, index) => {
      ear.rotation.x = Math.sin(time * 1.6 + index) * 0.08;
    });
    this.applySquash(time, moving);
  }

  getHeadPosition(out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(this.root.position).setY(this.root.position.y + 0.95);
  }
}

export class BowlFish extends BaseAnimal {
  private readonly fish = new THREE.Group();
  private bubble!: THREE.Mesh;
  private swimSpeed = 1;

  constructor() {
    super('jamal');
    this.buildBowl();
    this.buildFish();
    this.root.userData.animalId = 'jamal';
  }

  private buildBowl(): void {
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.4, 0.16, 14),
      toonMaterial(0xe3d3be)
    );
    stand.position.y = 0.08;
    stand.castShadow = true;
    outlined(stand, 1.04);
    this.pivot.add(stand);

    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.26, 0.36, 16),
      new THREE.MeshToonMaterial({ color: BOWL_WATER, transparent: true, opacity: 0.7 })
    );
    water.position.y = 0.36;
    this.pivot.add(water);

    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      new THREE.MeshBasicMaterial({
        color: BOWL_GLASS,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    glass.rotation.x = Math.PI;
    glass.position.y = 0.52;
    this.pivot.add(glass);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.355, 0.018, 6, 22),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.52;
    this.pivot.add(rim);

    this.bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
    );
    this.bubble.position.set(0.1, 0.4, 0.1);
    this.pivot.add(this.bubble);

    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.02, 14),
      toonMaterial(0xf4dfc0)
    );
    label.position.y = 0.02;
        this.pivot.add(label);
      }

  private buildFish(): void {
    const body = new THREE.Mesh(sphereGeometry(0.075, 12), toonMaterial(0xd96a7c));
    body.scale.set(1.5, 0.95, 0.75);
    outlined(body, 1.08);
    this.fish.add(body);

    for (const dir of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 5), toonMaterial(0xf0a9b8));
      fin.rotation.z = dir * 1.1;
      fin.position.set(dir * 0.08, -0.01, 0);
      this.fish.add(fin);
    }

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.11, 4), toonMaterial(0xf0a9b8));
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.14;
    this.fish.add(tail);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 6, 5),
      new THREE.MeshBasicMaterial({ color: INK })
    );
    eye.position.set(0.07, 0.015, 0.05);
    this.fish.add(eye);

    this.fish.position.y = 0.36;
    this.pivot.add(this.fish);
  }

  update(dt: number, time: number, _player: THREE.Vector3, active: boolean): void {
    this.swimSpeed = THREE.MathUtils.damp(this.swimSpeed, this.reaction > 0 ? 2.6 : 1, 3, dt);
    const angle = time * 0.7 * this.swimSpeed + this.phase;
    this.fish.position.x = Math.cos(angle) * 0.13;
    this.fish.position.z = Math.sin(angle) * 0.13;
    this.fish.position.y = 0.36 + Math.sin(time * 2.2) * 0.02;
    this.fish.rotation.y = -angle + Math.PI / 2;
    this.fish.rotation.z = Math.sin(time * 6 * this.swimSpeed) * 0.1;

    this.bubble.position.y = 0.36 + ((time * 0.12 + this.phase) % 0.24);
    this.bubble.position.x = Math.sin(time * 0.8) * 0.08;
    this.bubble.scale.setScalar(0.6 + Math.sin(time * 3) * 0.2);

    if (this.reaction > 0) this.reaction = Math.max(0, this.reaction - dt * 0.6);
    const scale = 1 + Math.sin(time * 2.4) * 0.012 + this.reaction * 0.03;
    this.pivot.scale.setScalar(scale * (active ? 1 : 1));
  }

  getHeadPosition(out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(this.root.position).setY(this.root.position.y + 0.95);
  }
}

export class Chick extends BaseAnimal {
  private readonly wings: THREE.Group[] = [];

  constructor() {
    super('anak-ayam');
    this.build();
  }

  private build(): void {
    const body = new THREE.Mesh(sphereGeometry(0.17, 14), toonMaterial(CHICK_YELLOW));
    body.scale.set(1, 1.05, 0.95);
    body.position.y = 0.2;
    body.castShadow = true;
    outlined(body, 1.06);
    this.pivot.add(body);

    const head = new THREE.Mesh(sphereGeometry(0.135, 14), toonMaterial(CHICK_YELLOW));
    head.position.set(0, 0.38, 0.03);
    outlined(head, 1.06);
    this.pivot.add(head);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), toonMaterial(BEAK));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.36, 0.15);
    this.pivot.add(beak);

    for (const dir of [-1, 1]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.019, 6, 5),
        new THREE.MeshBasicMaterial({ color: INK })
      );
      eye.position.set(dir * 0.055, 0.41, 0.11);
      this.pivot.add(eye);

      const cheek = new THREE.Mesh(
        new THREE.CircleGeometry(0.03, 10),
        new THREE.MeshBasicMaterial({ color: 0xf7b5b0, transparent: true, opacity: 0.5, depthWrite: false })
      );
      cheek.position.set(dir * 0.09, 0.35, 0.115);
      this.pivot.add(cheek);

      const wing = new THREE.Group();
      wing.position.set(dir * 0.16, 0.22, 0);
      const mesh = new THREE.Mesh(sphereGeometry(0.075, 10), toonMaterial(0xe9c469));
      mesh.scale.set(0.5, 0.9, 1.1);
      outlined(mesh, 1.08);
      wing.add(mesh);
      this.pivot.add(wing);
      this.wings.push(wing);
    }

    for (const dir of [-1, 1]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 4), toonMaterial(BEAK));
      foot.position.set(dir * 0.06, 0.05, 0.03);
      foot.rotation.z = dir * 0.2;
      this.pivot.add(foot);
    }

    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 4), toonMaterial(0xe9c469));
    tuft.position.set(0, 0.5, 0);
    this.pivot.add(tuft);
  }

  update(dt: number, time: number, player: THREE.Vector3, active: boolean): void {
    const distance = Math.hypot(player.x - this.root.position.x, player.z - this.root.position.z);
    let moving = 0;
    if (active && distance > 1.25 && distance < 11) {
      const dx = player.x - this.root.position.x;
      const dz = player.z - this.root.position.z;
      const length = Math.hypot(dx, dz) || 1;
      const speed = distance > 4 ? 3.6 : 2.4;
      this.root.position.x += (dx / length) * speed * dt;
      this.root.position.z += (dz / length) * speed * dt;
      this.faceMovement(dx, dz, dt);
      this.hop += dt * 15;
      moving = 1;
    } else {
      this.hop = THREE.MathUtils.damp(this.hop % (Math.PI * 2), 0, 8, dt);
      if (distance < 1.6) {
        this.facing += (1 - Math.exp(-5 * dt)) * Math.atan2(
          Math.sin(Math.atan2(player.x - this.root.position.x, player.z - this.root.position.z) - this.facing),
          Math.cos(Math.atan2(player.x - this.root.position.x, player.z - this.root.position.z) - this.facing)
        );
        this.root.rotation.y = this.facing;
      }
    }

    this.wings.forEach((wing, index) => {
      const flap = moving > 0.1 ? Math.sin(time * 22) * 0.5 : Math.sin(time * 2 + index) * 0.08;
      wing.rotation.z = (index === 0 ? -1 : 1) * (0.2 + Math.abs(flap));
    });
    this.applySquash(time, moving);
  }

  getHeadPosition(out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(this.root.position).setY(this.root.position.y + 0.6);
  }
}

export function createAnimals(): AnimalActor[] {
  return [new Cimoy(), new BowlFish(), new Chick()];
}