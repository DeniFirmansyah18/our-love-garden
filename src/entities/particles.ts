import * as THREE from 'three';

export type BurstKind = 'heart' | 'star' | 'petal' | 'note';

const VERTEX = `
attribute float aSize;
attribute float aAlpha;
attribute float aSpin;
varying float vAlpha;
varying float vSpin;
void main() {
  vAlpha = aAlpha;
  vSpin = aSpin;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (320.0 / max(0.001, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT = `
uniform sampler2D map;
uniform vec3 color;
varying float vAlpha;
varying float vSpin;
void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float s = sin(vSpin);
  float c = cos(vSpin);
  uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + vec2(0.5);
  vec4 tex = texture2D(map, uv);
  if (tex.a < 0.02 || vAlpha < 0.01) discard;
  gl_FragColor = vec4(color * tex.rgb, tex.a * vAlpha);
}
`;

interface Particle {
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  spin: number;
  spinSpeed: number;
  gravity: number;
  drag: number;
}

interface Pool {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  sizes: Float32Array;
  alphas: Float32Array;
  spins: Float32Array;
  particles: Particle[];
  cursor: number;
  active: number;
  kind: BurstKind;
}

const POOL_SIZE: Record<BurstKind, number> = {
  heart: 64,
  star: 48,
  petal: 48,
  note: 24
};

export class ParticleSystem {
  private readonly pools = new Map<BurstKind, Pool>();

  constructor(scene: THREE.Scene) {
    for (const kind of ['heart', 'star', 'petal', 'note'] as BurstKind[]) {
      const pool = this.createPool(kind);
      this.pools.set(kind, pool);
      scene.add(pool.points);
    }
  }

  private createPool(kind: BurstKind): Pool {
    const count = POOL_SIZE[kind];
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const spins = new Float32Array(count);
    positions.fill(0);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aSpin', new THREE.BufferAttribute(spins, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: makeTexture(kind) },
        color: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: kind === 'star' || kind === 'note' ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 5;

    return {
      points,
      geometry,
      positions,
      sizes,
      alphas,
      spins,
      cursor: 0,
      active: 0,
      particles: Array.from({ length: count }, () => ({
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        size: 1,
        spin: 0,
        spinSpeed: 0,
        gravity: 0,
        drag: 1
      })),
      kind
    };
  }

  burst(kind: BurstKind, position: THREE.Vector3, count = 6, spread = 1): void {
    const pool = this.pools.get(kind);
    if (!pool) return;

    for (let i = 0; i < count; i += 1) {
      const index = pool.cursor;
      pool.cursor = (pool.cursor + 1) % pool.particles.length;
      const particle = pool.particles[index];

      particle.life = 0.9 + Math.random() * 0.8;
      particle.maxLife = particle.life;
      particle.size = (kind === 'heart' ? 0.26 : kind === 'star' ? 0.22 : 0.2) * (0.7 + Math.random() * 0.7);
      particle.spin = Math.random() * Math.PI * 2;
      particle.spinSpeed = (Math.random() - 0.5) * 3;
      particle.drag = kind === 'star' ? 2.6 : 1.5;
      particle.gravity = kind === 'heart' ? 0.35 : kind === 'petal' ? -0.5 : 0;

      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.28 * spread;
      pool.positions[index * 3] = position.x + Math.cos(angle) * radius;
      pool.positions[index * 3 + 1] = position.y + (Math.random() - 0.2) * 0.2;
      pool.positions[index * 3 + 2] = position.z + Math.sin(angle) * radius;

      if (kind === 'star' || kind === 'note') {
        particle.vx = Math.cos(angle) * (0.9 + Math.random() * 1.4) * spread;
        particle.vz = Math.sin(angle) * (0.9 + Math.random() * 1.4) * spread;
        particle.vy = 0.7 + Math.random() * 1.2;
      } else {
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vz = (Math.random() - 0.5) * 0.5;
        particle.vy = 0.5 + Math.random() * 0.55;
      }

      pool.sizes[index] = particle.size;
      pool.alphas[index] = 0;
      pool.spins[index] = particle.spin;
    }

    (pool.geometry.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
  }

  ringOfHearts(position: THREE.Vector3, radius: number, count = 12): void {
    const pool = this.pools.get('heart');
    if (!pool) return;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const point = new THREE.Vector3(
        position.x + Math.cos(angle) * radius,
        position.y + 0.2,
        position.z + Math.sin(angle) * radius
      );
      this.burst('heart', point, 1, 0.2);
    }
  }

  update(dt: number): void {
    const delta = Math.min(dt, 0.05);
    for (const pool of this.pools.values()) {
      let active = 0;
      for (let i = 0; i < pool.particles.length; i += 1) {
        const particle = pool.particles[i];
        const sizeAttr = pool.sizes;
        if (particle.life <= 0) {
          if (pool.alphas[i] !== 0) pool.alphas[i] = 0;
          continue;
        }
        active += 1;
        particle.life -= delta;

        const damping = Math.max(0, 1 - particle.drag * delta);
        particle.vx *= damping;
        particle.vz *= damping;
        particle.vy = particle.vy * damping - particle.gravity * delta;
        particle.spin += particle.spinSpeed * delta;

        pool.positions[i * 3] += particle.vx * delta;
        pool.positions[i * 3 + 1] += particle.vy * delta;
        pool.positions[i * 3 + 2] += particle.vz * delta;

        const progress = 1 - particle.life / particle.maxLife;
        const fadeIn = Math.min(1, progress * 6);
        const fadeOut = Math.min(1, Math.max(0, (1 - progress) * 1.6));
        pool.alphas[i] = fadeIn * fadeOut * 0.95;
        sizeAttr[i] = particle.size * (1 + progress * 0.35);
        pool.spins[i] = particle.spin;
      }

      pool.active = active;
      pool.points.visible = active > 0;
      if (active > 0) {
        (pool.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        (pool.geometry.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
        (pool.geometry.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true;
        (pool.geometry.getAttribute('aSpin') as THREE.BufferAttribute).needsUpdate = true;
      }
    }
  }

  dispose(): void {
    for (const pool of this.pools.values()) {
      pool.geometry.dispose();
      const material = pool.points.material as THREE.ShaderMaterial;
      (material.uniforms.map.value as THREE.Texture | null)?.dispose();
      material.dispose();
    }
    this.pools.clear();
  }
}

function makeTexture(kind: BurstKind): THREE.Texture {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  if (kind === 'heart') {
    ctx.fillStyle = '#ff8fab';
    ctx.beginPath();
    ctx.moveTo(48, 82);
    ctx.bezierCurveTo(10, 56, 12, 22, 34, 22);
    ctx.bezierCurveTo(44, 22, 48, 30, 48, 34);
    ctx.bezierCurveTo(48, 30, 52, 22, 62, 22);
    ctx.bezierCurveTo(84, 22, 86, 56, 48, 82);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(36, 40, 7, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'star') {
    ctx.fillStyle = '#ffe9a8';
    ctx.translate(48, 48);
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(angle + 0.3) * 22, Math.sin(angle + 0.3) * 22, Math.cos(angle) * 44, Math.sin(angle) * 44);
      ctx.quadraticCurveTo(Math.cos(angle - 0.3) * 22, Math.sin(angle - 0.3) * 22, 0, 0);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'petal') {
    ctx.fillStyle = '#ffd1dc';
    ctx.beginPath();
    ctx.ellipse(48, 48, 20, 34, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(214, 122, 148, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(38, 26);
    ctx.quadraticCurveTo(52, 48, 56, 70);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.ellipse(38, 54, 10, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(44, 48);
    ctx.lineTo(44, 24);
    ctx.lineTo(66, 32);
    ctx.lineTo(66, 54);
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}