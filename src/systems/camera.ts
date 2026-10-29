import * as THREE from 'three';

const MIN_PITCH = 0.32;
const MAX_PITCH = 1.24;
const MIN_DISTANCE = 5.2;
const MAX_DISTANCE = 20;

export type CameraMode = 'showcase' | 'play';

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  yaw = 0.42;
  pitch = 0.82;
  distance = 12.4;
  mode: CameraMode = 'showcase';

  private readonly target = new THREE.Vector3(0, 1, 0);
    private readonly desiredPosition = new THREE.Vector3();
    private readonly lookAt = new THREE.Vector3();
    private portrait = false;
  private reducedMotion = false;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 220);
    this.camera.position.set(6, 7, 12);
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setViewport(aspect: number): void {
      const wasPortrait = this.portrait;
      this.camera.aspect = aspect;
      this.portrait = aspect < 0.85;
      this.camera.fov = this.portrait ? 52 : 46;
      if (wasPortrait !== this.portrait) this.applyModeDefaults();
      this.camera.updateProjectionMatrix();
    }

  rotateBy(dx: number, dy: number): void {
    this.yaw -= dx * 0.0055;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.0042, MIN_PITCH, MAX_PITCH);
  }

  zoomBy(factor: number): void {
    const max = this.mode === 'showcase' ? 11 : MAX_DISTANCE;
    this.distance = THREE.MathUtils.clamp(this.distance * factor, MIN_DISTANCE, max);
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
      this.applyModeDefaults();
      if (mode === 'showcase') this.yaw = 0.24;
    }

    private applyModeDefaults(): void {
      const shortScreen =
        typeof window !== 'undefined' && window.innerHeight < 640 && this.portrait;
      if (this.mode === 'showcase') {
        this.distance = this.portrait ? (shortScreen ? 10.2 : 8.4) : 7;
        this.pitch = 0.52;
      } else {
        this.distance = this.portrait ? 12.2 : 11;
        this.pitch = 0.66;
      }
    }

  update(dt: number, focus: THREE.Vector3): void {
      const lambda = this.reducedMotion ? 30 : 6.5;
      this.target.lerp(focus, 1 - Math.exp(-lambda * dt));

      const lookY = this.target.y + (this.mode === 'showcase' ? 0 : 0.7);

      const horizontal = Math.cos(this.pitch) * this.distance;
    const vertical = Math.sin(this.pitch) * this.distance;
    this.desiredPosition.set(
      this.target.x + Math.sin(this.yaw) * horizontal,
      this.target.y + vertical,
      this.target.z + Math.cos(this.yaw) * horizontal
    );

    const follow = this.reducedMotion ? 30 : 8;
    this.camera.position.lerp(this.desiredPosition, 1 - Math.exp(-follow * dt));
    this.lookAt.set(this.target.x, lookY, this.target.z);
    this.camera.lookAt(this.lookAt);
  }

  snapTo(focus: THREE.Vector3): void {
    this.target.copy(focus);
    const horizontal = Math.cos(this.pitch) * this.distance;
    const vertical = Math.sin(this.pitch) * this.distance;
    this.camera.position.set(
      focus.x + Math.sin(this.yaw) * horizontal,
      focus.y + vertical,
      focus.z + Math.cos(this.yaw) * horizontal
    );
    this.camera.lookAt(focus.x, focus.y + 0.7, focus.z);
  }

  getDistance(): number {
    return this.distance;
  }
}