import * as THREE from 'three';
import { Face, type Expression } from './face';
import { buildAccessory, buildBow, type AccessoryId } from './accessories';
import { OUTLINE_MATERIAL, outlined, sphereGeometry, toonMaterial } from './toon';

export type Role = 'bubu' | 'dudu';
export type EmoteKind = 'happy' | 'shy' | 'wave' | 'hug' | 'hold' | 'kiss' | 'dance' | 'sleep';

export interface CharacterConfig {
  role: Role;
  headColor: number;
  bodyColor: number;
  earColor: number;
  earInnerColor: number;
  muzzleColor?: number;
  cheekColor: number;
  scale?: number;
  hasRibbon?: boolean;
}

interface Pose {
  armLX: number;
  armLZ: number;
  armRX: number;
  armRZ: number;
  headTilt: number;
  headNod: number;
  bodyTilt: number;
  hopBoost: number;
}

const HEAD_RADIUS = 0.5;
const TORSO_RADIUS = 0.42;

export class Character {
  readonly root = new THREE.Group();
  readonly role: Role;
  readonly pivot = new THREE.Group();

  face!: Face;
  private readonly config: CharacterConfig;
  private readonly headGroup = new THREE.Group();
  private readonly bodyGroup = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly footL = new THREE.Group();
  private readonly footR = new THREE.Group();
  private readonly earL = new THREE.Group();
  private readonly earR = new THREE.Group();
  private readonly cheekMaterial: THREE.MeshBasicMaterial;
  private readonly cheekL: THREE.Mesh;
  private readonly cheekR: THREE.Mesh;
  private accessoryGroup: THREE.Group | null = null;
  private ribbonGroup: THREE.Group | null = null;
  private ribbonColor = '#EA8FA6';

  private destination: THREE.Vector3 | null = null;
  private input = new THREE.Vector2();
  private speed = 0;
  private facing = 0;
  private hopPhase = 0;
  private blinkTimer = 2.4;
  private blinkHold = 0;
  private emote: EmoteKind | null = null;
  private emoteTime = 0;
  private emoteDuration = 1.8;
  private popTime = 0;
  private pose: Pose = {
    armLX: 0,
    armLZ: -0.16,
    armRX: 0,
    armRZ: 0.16,
    headTilt: 0,
    headNod: 0,
    bodyTilt: 0,
    hopBoost: 0
  };
  private blush = 0.4;
  private targetBlush = 0.4;
  private expression: Expression = 'neutral';
  private readonly radius: number;

  constructor(config: CharacterConfig) {
    this.config = config;
    this.role = config.role;
    this.radius = 0.34;
    this.root.add(this.pivot);
    this.pivot.add(this.bodyGroup, this.headGroup);
    if (config.scale) this.root.scale.setScalar(config.scale);

    this.buildBody();
    this.buildHead();

    const cheeks = this.buildCheeks();
    this.cheekMaterial = cheeks.material;
    this.cheekL = cheeks.left;
    this.cheekR = cheeks.right;

    if (config.hasRibbon) {
      this.ribbonGroup = buildBow('#EA8FA6', 0.95);
      this.ribbonGroup.position.set(0, -0.44, 0.26);
      this.ribbonGroup.rotation.x = 0.25;
      this.headGroup.add(this.ribbonGroup);
    }

    this.setExpression('neutral');
  }

  private buildBody(): void {
    const torso = new THREE.Mesh(
      sphereGeometry(TORSO_RADIUS, 20),
      toonMaterial(this.config.bodyColor)
    );
    torso.scale.set(1, 0.94, 0.96);
    torso.position.y = 0.45;
    torso.castShadow = true;
    outlined(torso, 1.05);
    this.bodyGroup.add(torso);

    const belly = new THREE.Mesh(
      sphereGeometry(TORSO_RADIUS * 0.74, 16),
      toonMaterial(this.role === 'bubu' ? 0xfff7ef : 0xf2c9a8)
    );
    belly.scale.set(1, 0.86, 0.5);
    belly.position.set(0, 0.42, 0.27);
    this.bodyGroup.add(belly);

    this.bodyGroup.add(this.armL, this.armR, this.footL, this.footR);

    for (const [group, dir] of [
      [this.armL, -1],
      [this.armR, 1]
    ] as const) {
      group.position.set(dir * 0.38, 0.56, 0);
      const arm = new THREE.Mesh(
        sphereGeometry(0.125, 14),
        toonMaterial(this.config.bodyColor)
      );
      arm.scale.set(1, 1.55, 1);
      arm.position.y = -0.16;
      arm.castShadow = true;
      outlined(arm, 1.07);
      group.add(arm);
      group.rotation.z = dir * 0.16;
    }

    for (const [group, dir] of [
      [this.footL, -1],
      [this.footR, 1]
    ] as const) {
      group.position.set(dir * 0.17, 0.12, 0.04);
      const foot = new THREE.Mesh(
        sphereGeometry(0.14, 12),
        toonMaterial(this.config.earColor)
      );
      foot.scale.set(1, 0.78, 1.22);
      foot.castShadow = true;
      outlined(foot, 1.07);
      group.add(foot);
    }
  }

  private buildHead(): void {
    this.headGroup.position.y = 1.15;
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(
      sphereGeometry(HEAD_RADIUS, 24),
      toonMaterial(this.config.headColor)
    );
    head.castShadow = true;
    outlined(head, 1.045);
    this.headGroup.add(head);

    if (this.config.muzzleColor) {
      const muzzle = new THREE.Mesh(
        sphereGeometry(0.2, 16),
        toonMaterial(this.config.muzzleColor)
      );
      muzzle.scale.set(1.35, 0.95, 0.62);
      muzzle.position.set(0, -0.12, 0.4);
      this.headGroup.add(muzzle);
    }

    this.face = new Face(HEAD_RADIUS, {
      ink: '#3b1a15',
      mouth: '#5c3a30',
      tongue: '#f08f9f',
      tear: '#bcdff2'
    });
    this.face.mesh.position.set(0, 0.015, HEAD_RADIUS * 0.8);
    this.headGroup.add(this.face.mesh);

    for (const [group, dir] of [
      [this.earL, -1],
      [this.earR, 1]
    ] as const) {
      group.position.set(dir * 0.34, 0.36, -0.02);
      const ear = new THREE.Mesh(
        sphereGeometry(0.155, 14),
        toonMaterial(this.config.earColor)
      );
      ear.scale.set(1, 1, 0.72);
      ear.castShadow = true;
      outlined(ear, 1.07);
      group.add(ear);

      const inner = new THREE.Mesh(
        sphereGeometry(0.088, 12),
        toonMaterial(this.config.earInnerColor)
      );
      inner.scale.set(1, 1, 0.5);
      inner.position.z = 0.1;
      group.add(inner);

      this.headGroup.add(group);
    }
  }

  private buildCheeks(): { left: THREE.Mesh; right: THREE.Mesh; material: THREE.MeshBasicMaterial } {
    const material = new THREE.MeshBasicMaterial({
      color: this.config.cheekColor,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    const geometry = new THREE.CircleGeometry(0.1, 18);

    const left = new THREE.Mesh(geometry, material);
    left.position.set(-0.29, -0.11, 0.05);
    left.renderOrder = 3;
    this.face.mesh.add(left);

    const right = new THREE.Mesh(geometry, material);
    right.position.set(0.29, -0.11, 0.05);
    right.renderOrder = 3;
    this.face.mesh.add(right);

    return { left, right, material };
  }

  setRibbonColor(hex: string): void {
    this.ribbonColor = hex;
    if (!this.config.hasRibbon) return;
    if (this.ribbonGroup) {
      this.headGroup.remove(this.ribbonGroup);
      disposeGroup(this.ribbonGroup);
    }
    this.ribbonGroup = buildBow(hex, 0.95);
    this.ribbonGroup.position.set(0, -0.44, 0.26);
    this.ribbonGroup.rotation.x = 0.25;
    this.headGroup.add(this.ribbonGroup);
  }

  setAccessory(id: AccessoryId): void {
    if (this.accessoryGroup) {
      this.accessoryGroup.parent?.remove(this.accessoryGroup);
      disposeGroup(this.accessoryGroup);
      this.accessoryGroup = null;
    }
    if (id === 'none') return;

    const group = buildAccessory(id, this.ribbonColor);
    if (!group) return;

    if (id === 'scarf' || id === 'bowtie') {
      this.bodyGroup.add(group);
      group.position.set(0, id === 'scarf' ? 0.88 : 0.78, id === 'scarf' ? 0.02 : 0.3);
      if (id === 'bowtie') group.rotation.x = 0.2;
    } else if (id === 'glasses') {
      this.headGroup.add(group);
      group.position.set(0, 0.03, HEAD_RADIUS * 0.93);
    } else if (id === 'flower-crown' || id === 'flower-band') {
      this.headGroup.add(group);
      group.position.set(0, id === 'flower-crown' ? 0.1 : 0.2, -0.02);
      group.rotation.x = -0.06;
      group.scale.setScalar(id === 'flower-crown' ? 1.02 : 1.06);
    } else if (id === 'leaf-hat') {
      this.headGroup.add(group);
      group.position.set(0, 0.33, 0.02);
      group.rotation.set(-0.12, 0, 0.08);
    } else {
      this.headGroup.add(group);
          group.position.set(0, HEAD_RADIUS * 0.88, 0.02);
          group.rotation.set(-0.14, 0, 0);
    }

    this.accessoryGroup = group;
  }

  setExpression(expression: Expression): void {
    this.expression = expression;
    this.face.setExpression(expression);
  }

  getExpression(): Expression {
    return this.expression;
  }

  playEmote(kind: EmoteKind, duration = 1.6): void {
    this.emote = kind;
    this.emoteTime = 0;
    this.emoteDuration = duration;
    if (kind === 'happy') this.setExpression('happy');
    else if (kind === 'shy') this.setExpression('shy');
    else if (kind === 'kiss') this.setExpression('love');
    else if (kind === 'sleep') this.setExpression('sleepy');
    else if (kind === 'hug') this.setExpression('love');
    else if (kind === 'dance') this.setExpression('happy');
  }

  isEmoting(): boolean {
    return this.emote !== null;
  }

  currentEmote(): EmoteKind | null {
    return this.emote;
  }

  pop(): void {
    this.popTime = 1;
    this.setExpression('surprised');
    window.setTimeout(() => {
      if (this.emote === null) this.setExpression('happy');
    }, 420);
  }

  setBlush(value: number): void {
    this.targetBlush = THREE.MathUtils.clamp(value, 0.25, 1);
  }

  getRadius(): number {
    return this.radius;
  }

  getFacing(): number {
    return this.facing;
  }

  setDestination(x: number, z: number): void {
    this.destination = new THREE.Vector3(x, 0, z);
    this.emote = null;
  }

  clearDestination(): void {
    this.destination = null;
  }

  setInput(x: number, z: number): void {
    this.input.set(x, z);
    if (x !== 0 || z !== 0) this.destination = null;
  }

  hasDestination(): boolean {
    return this.destination !== null;
  }

  getSpeed(): number {
    return this.speed;
  }

  stop(): void {
    this.destination = null;
    this.input.set(0, 0);
    this.speed = 0;
  }

  update(dt: number, time: number): void {
    const delta = Math.min(dt, 0.05);
        const move = this.resolveMovement();
        this.applyMovement(move, delta, time);
        this.applyFace(delta);
        this.applyPose(delta, time, move.length());
      }

      private resolveMovement(): THREE.Vector2 {
        const desired = new THREE.Vector2();
        if (this.input.lengthSq() > 0.0001) {
          desired.copy(this.input).normalize();
        } else if (this.destination) {
          const dx = this.destination.x - this.root.position.x;
          const dz = this.destination.z - this.root.position.z;
          const distance = Math.hypot(dx, dz);
          if (distance < 0.12) {
            this.destination = null;
          } else {
            desired.set(dx / distance, dz / distance);
          }
        }
        return desired;
      }

  private applyMovement(move: THREE.Vector2, delta: number, time: number): void {
    const rawSpeed = move.length() > 0 ? 2.9 : 0;
    this.speed = THREE.MathUtils.damp(this.speed, rawSpeed, 9, delta);

    if (move.lengthSq() > 0.0001) {
      const targetFacing = Math.atan2(move.x, move.y);
      this.facing = dampAngle(this.facing, targetFacing, 10, delta);
    }
    this.root.rotation.y = this.facing;

    if (this.speed > 0.05) {
      const step = this.speed * delta;
      this.root.position.x += Math.sin(this.facing) * step;
      this.root.position.z += Math.cos(this.facing) * step;
      this.hopPhase += delta * (6.4 + this.speed * 1.6);
    } else {
      this.hopPhase = THREE.MathUtils.damp(this.hopPhase % (Math.PI * 2), 0, 6, delta);
    }

    const moving = this.speed / 2.9;
    const hop = Math.abs(Math.sin(this.hopPhase)) * moving;
    const squash = 1 + (hop - 0.45) * 0.12 * moving;

    this.pivot.position.y = hop * 0.14;
    this.pivot.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    const breathe = Math.sin(time * 1.7) * 0.012 * (1 - moving);
    this.pivot.scale.y *= 1 + breathe;

    if (this.popTime > 0) {
      this.popTime = Math.max(0, this.popTime - delta * 3.2);
      const pop = Math.sin((1 - this.popTime) * Math.PI) * 0.9;
      this.pivot.scale.y += pop * 0.16;
      this.pivot.scale.x -= pop * 0.1;
      this.pivot.scale.z -= pop * 0.1;
    }

    this.footL.rotation.x = Math.sin(this.hopPhase) * 0.35 * moving;
    this.footR.rotation.x = -Math.sin(this.hopPhase) * 0.35 * moving;
  }

  private applyFace(delta: number): void {
    if (this.emote !== null) {
      this.emoteTime += delta;
      if (this.emoteTime >= this.emoteDuration) {
        this.emote = null;
        this.setExpression('neutral');
      }
    }

    this.blinkTimer -= delta;
    if (this.blinkHold > 0) {
      this.blinkHold -= delta;
      if (this.blinkHold <= 0) this.face.setClosed(false);
    } else if (this.blinkTimer <= 0) {
      this.face.setClosed(true);
      this.blinkHold = 0.12;
      this.blinkTimer = 2.4 + Math.random() * 3.2;
    }

    this.blush = THREE.MathUtils.damp(this.blush, this.targetBlush, 3, delta);
    this.cheekMaterial.opacity = 0.25 + this.blush * 0.6;
    const cheekScale = 1 + this.blush * 0.35;
    this.cheekL.scale.setScalar(cheekScale);
    this.cheekR.scale.setScalar(cheekScale);
  }

  private applyPose(delta: number, time: number, moving: number): void {
    const target: Pose = {
      armLX: 0,
      armLZ: -0.16,
      armRX: 0,
      armRZ: 0.16,
      headTilt: 0,
      headNod: 0,
      bodyTilt: 0,
      hopBoost: 0
    };

    const walkSwing = Math.sin(this.hopPhase) * 0.55 * moving;
    target.armLX = walkSwing;
    target.armRX = -walkSwing;
    target.armLZ = -0.16 - Math.abs(walkSwing) * 0.2;
    target.armRZ = 0.16 + Math.abs(walkSwing) * 0.2;
    target.headNod = moving * 0.06;

    const emoteProgress = this.emote ? this.emoteTime / this.emoteDuration : 0;
    const emotePulse = Math.sin(Math.min(1, emoteProgress) * Math.PI);

    switch (this.emote) {
      case 'happy':
        target.armLZ = 2.55;
        target.armRZ = -2.55;
        target.armLX = -0.35;
        target.armRX = -0.35;
        target.headTilt = 0.12;
        target.hopBoost = emotePulse * 0.06;
        break;
      case 'shy':
        target.armRZ = -2.45;
        target.armRX = -0.55;
        target.armLZ = -0.5;
        target.headTilt = -0.16;
        target.headNod = 0.14;
        break;
      case 'wave':
        target.armRZ = -2.75;
        target.armRX = Math.sin(time * 9) * 0.32;
        target.headTilt = -0.08;
        break;
      case 'hug':
        target.armLX = -1.25;
        target.armRX = -1.25;
        target.armLZ = 0.5;
        target.armRZ = -0.5;
        target.headTilt = 0.16;
        target.headNod = 0.1;
        break;
      case 'hold':
        target.armRX = -0.7;
        target.armRZ = 1.05;
        target.headTilt = -0.06;
        break;
      case 'kiss':
        target.headTilt = 0.22;
        target.headNod = 0.18;
        target.armLZ = -0.9;
        target.armRZ = 0.5;
        target.bodyTilt = 0.14;
        break;
      case 'dance':
        target.armLZ = 2.2 + Math.sin(time * 7) * 0.35;
        target.armRZ = -2.2 - Math.sin(time * 7 + Math.PI) * 0.35;
        target.headTilt = Math.sin(time * 3.4) * 0.14;
        target.bodyTilt = Math.sin(time * 3.4 + 1) * 0.06;
        target.hopBoost = Math.abs(Math.sin(time * 6)) * 0.1;
        break;
      case 'sleep':
        target.headTilt = 0.24;
        target.headNod = 0.22;
        target.armLZ = -0.05;
        target.armRZ = 0.05;
        break;
      default:
        break;
    }

    const stiffness = 11;
    this.pose.armLX = THREE.MathUtils.damp(this.pose.armLX, target.armLX, stiffness, delta);
    this.pose.armLZ = THREE.MathUtils.damp(this.pose.armLZ, target.armLZ, stiffness, delta);
    this.pose.armRX = THREE.MathUtils.damp(this.pose.armRX, target.armRX, stiffness, delta);
    this.pose.armRZ = THREE.MathUtils.damp(this.pose.armRZ, target.armRZ, stiffness, delta);
    this.pose.headTilt = THREE.MathUtils.damp(this.pose.headTilt, target.headTilt, 8, delta);
    this.pose.headNod = THREE.MathUtils.damp(this.pose.headNod, target.headNod, 8, delta);
    this.pose.bodyTilt = THREE.MathUtils.damp(this.pose.bodyTilt, target.bodyTilt, 7, delta);

    this.armL.rotation.x = this.pose.armLX;
    this.armL.rotation.z = this.pose.armLZ;
    this.armR.rotation.x = this.pose.armRX;
    this.armR.rotation.z = this.pose.armRZ;

    const sway = Math.sin(time * 1.5) * 0.05 * (1 - moving);
    this.headGroup.rotation.z = this.pose.headTilt + sway;
    this.headGroup.rotation.x = this.pose.headNod;
    this.bodyGroup.rotation.z = this.pose.bodyTilt + sway * 0.4;
    this.earL.rotation.z = Math.sin(time * 1.9) * 0.09 + this.pose.headTilt * 0.4;
    this.earR.rotation.z = Math.sin(time * 1.9 + 0.8) * 0.09 + this.pose.headTilt * 0.4;
    this.pivot.position.y += target.hopBoost * 2;
  }

  getHeadWorldPosition(out = new THREE.Vector3()): THREE.Vector3 {
    return this.headGroup.getWorldPosition(out);
  }

  faceToward(point: THREE.Vector3, delta: number): void {
    const dx = point.x - this.root.position.x;
    const dz = point.z - this.root.position.z;
    if (Math.abs(dx) + Math.abs(dz) < 0.001) return;
    const target = Math.atan2(dx, dz);
    this.facing = dampAngle(this.facing, target, 4, delta);
    this.root.rotation.y = this.facing;
  }
}

function dampAngle(current: number, target: number, lambda: number, delta: number): number {
  let difference = (target - current) % (Math.PI * 2);
  if (difference > Math.PI) difference -= Math.PI * 2;
  if (difference < -Math.PI) difference += Math.PI * 2;
  return current + difference * (1 - Math.exp(-lambda * delta));
}

function disposeGroup(group: THREE.Object3D): void {
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((entry) => {
        if (entry !== OUTLINE_MATERIAL) entry.dispose();
      });
    } else if (material && material !== OUTLINE_MATERIAL) {
      material.dispose();
    }
  });
}