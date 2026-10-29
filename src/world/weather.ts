import * as THREE from 'three';

const VERTEX = `
attribute float aSize;
attribute float aOpacity;
attribute float aSpin;
uniform float uTime;
varying float vOpacity;
varying float vSpin;
void main() {
  vOpacity = aOpacity;
  vSpin = aSpin + uTime * 0.6;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (300.0 / max(0.001, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT = `
uniform sampler2D map;
uniform vec3 color;
varying float vOpacity;
varying float vSpin;
void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float s = sin(vSpin);
  float c = cos(vSpin);
  uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + vec2(0.5);
  vec4 tex = texture2D(map, uv);
  if (tex.a < 0.03) discard;
  gl_FragColor = vec4(color * tex.rgb, tex.a * vOpacity);
}
`;

/** Soft sakura drift. One draw call, wraps in a cylinder around the island. */
export class PetalWeather {
  readonly points: THREE.Points;
  private readonly material: THREE.ShaderMaterial;
  private readonly positions: Float32Array;
  private readonly spins: Float32Array;
  private readonly count: number;
  private readonly area = 22;
  private readonly height = 12;

  constructor(scene: THREE.Scene, count = 90) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.spins = new Float32Array(count);
    const sizes = new Float32Array(count);
    const opacity = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * this.area;
      this.positions[i * 3] = Math.cos(angle) * radius;
      this.positions[i * 3 + 1] = Math.random() * this.height;
      this.positions[i * 3 + 2] = Math.sin(angle) * radius;
      this.spins[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.13 + Math.random() * 0.12;
      opacity[i] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('aSpin', new THREE.BufferAttribute(this.spins, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacity, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: makePetalTexture() },
        color: { value: new THREE.Color(0xffd9e2) },
        uTime: { value: 0 }
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    scene.add(this.points);
  }

  update(dt: number, time: number, amount = 1): void {
    this.material.uniforms.uTime.value = time;
    const opacity = (this.points.geometry.getAttribute('aOpacity') as THREE.BufferAttribute);
    for (let i = 0; i < this.count; i += 1) {
      this.positions[i * 3] += (0.32 + Math.sin(time * 0.6 + i) * 0.22) * dt;
      this.positions[i * 3 + 1] -= (0.5 + (i % 5) * 0.07) * dt;
      this.positions[i * 3 + 2] += Math.cos(time * 0.5 + i * 0.7) * 0.24 * dt;

      if (this.positions[i * 3 + 1] < 0.05) {
        this.positions[i * 3 + 1] = this.height;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * this.area;
        this.positions[i * 3] = Math.cos(angle) * radius;
        this.positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      if (this.positions[i * 3] > this.area) this.positions[i * 3] = -this.area;
      if (this.positions[i * 3 + 2] > this.area) this.positions[i * 3 + 2] = -this.area;

      const fade = amount * (0.55 + (i % 4) * 0.1);
      opacity.setX(i, fade * Math.min(1, this.positions[i * 3 + 1] * 0.6));
    }
    (this.points.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    opacity.needsUpdate = true;
  }

  setVisible(visible: boolean): void {
    this.points.visible = visible;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.material.uniforms.map.value as THREE.Texture | null)?.dispose();
    this.material.dispose();
  }
}

function makePetalTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffe4ea';
    ctx.beginPath();
    ctx.ellipse(32, 34, 13, 22, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(214, 122, 148, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(25, 18);
    ctx.quadraticCurveTo(34, 34, 37, 50);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}