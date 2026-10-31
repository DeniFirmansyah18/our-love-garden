import * as THREE from 'three';

interface SkyKeyframe {
  t: number;
  top: number;
  bottom: number;
  sun: number;
  sunIntensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  fog: number;
  ambient: number;
}

const KEYS: SkyKeyframe[] = [
  {
    t: 0.0,
    top: 0x2a2347,
    bottom: 0x5a4a6b,
    sun: 0x9fb7e0,
    sunIntensity: 0.35,
    hemiSky: 0x4b4a7a,
    hemiGround: 0x3b3140,
    hemiIntensity: 0.55,
    fog: 0x4b4263,
    ambient: 0.3
  },
  {
    t: 0.18,
    top: 0x4b3f6b,
    bottom: 0xe8a7a0,
    sun: 0xffb08a,
    sunIntensity: 0.8,
    hemiSky: 0x8a7aa8,
    hemiGround: 0x6b5a55,
    hemiIntensity: 0.7,
    fog: 0xc99a9a,
    ambient: 0.4
  },
  {
    t: 0.28,
    top: 0x9fc4dd,
    bottom: 0xffe3c4,
    sun: 0xffd9a8,
    sunIntensity: 1.5,
    hemiSky: 0xdbe9f2,
    hemiGround: 0xd9c2a4,
    hemiIntensity: 0.9,
    fog: 0xf3e2cf,
    ambient: 0.45
  },
  {
    t: 0.42,
    top: 0x9ecbe6,
    bottom: 0xf5efe0,
    sun: 0xfff4d8,
    sunIntensity: 1.9,
    hemiSky: 0xe4f1f7,
    hemiGround: 0xcfd9b6,
    hemiIntensity: 1,
    fog: 0xf0eee2,
    ambient: 0.5
  },
  {
    t: 0.56,
    top: 0x9ac3e0,
    bottom: 0xfdf0dc,
    sun: 0xffeccd,
    sunIntensity: 1.85,
    hemiSky: 0xe7f0f0,
    hemiGround: 0xd3c9a8,
    hemiIntensity: 1,
    fog: 0xf6ead9,
    ambient: 0.48
  },
  {
    t: 0.7,
    top: 0xa9b8cf,
    bottom: 0xffd6b0,
    sun: 0xffc48a,
    sunIntensity: 1.6,
    hemiSky: 0xf1ddc4,
    hemiGround: 0xc9a88a,
    hemiIntensity: 0.9,
    fog: 0xf2d4b8,
    ambient: 0.45
  },
  {
    t: 0.8,
    top: 0x8f7c9f,
    bottom: 0xf3a48f,
    sun: 0xff9d72,
    sunIntensity: 1.15,
    hemiSky: 0xc9a3ab,
    hemiGround: 0x9b7568,
    hemiIntensity: 0.75,
    fog: 0xdcae9e,
    ambient: 0.4
  },
  {
    t: 0.88,
    top: 0x4f3f6d,
    bottom: 0x9a6c84,
    sun: 0xc8a0c8,
    sunIntensity: 0.6,
    hemiSky: 0x6f5f8a,
    hemiGround: 0x4e4152,
    hemiIntensity: 0.6,
    fog: 0x7c6480,
    ambient: 0.34
  },
  {
    t: 1.0,
    top: 0x2a2347,
    bottom: 0x5a4a6b,
    sun: 0x9fb7e0,
    sunIntensity: 0.35,
    hemiSky: 0x4b4a7a,
    hemiGround: 0x3b3140,
    hemiIntensity: 0.55,
    fog: 0x4b4263,
    ambient: 0.3
  }
];

const SKY_VERT = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAG = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform float sunGlow;
varying vec3 vWorldPosition;

void main() {
  vec3 direction = normalize(vWorldPosition);
  float height = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 color = mix(bottomColor, topColor, pow(height, 1.25));
  float sunAmount = max(dot(direction, normalize(sunDirection)), 0.0);
  color += sunColor * pow(sunAmount, 12.0) * sunGlow;
  color += sunColor * pow(sunAmount, 120.0) * sunGlow * 0.6;
  gl_FragColor = vec4(color, 1.0);
}
`;

export interface SkyState {
  hour: number;
  phase: 'morning' | 'afternoon' | 'evening' | 'night';
  daylight: number;
}

export class SkySystem {
  readonly group = new THREE.Group();
  readonly sunLight: THREE.DirectionalLight;
  readonly moonLight: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly ambient: THREE.AmbientLight;

  private readonly dome: THREE.Mesh;
  private readonly uniforms: {
    topColor: { value: THREE.Color };
    bottomColor: { value: THREE.Color };
    sunColor: { value: THREE.Color };
    sunDirection: { value: THREE.Vector3 };
    sunGlow: { value: number };
  };
  private readonly sunMesh: THREE.Mesh;
  private readonly moonMesh: THREE.Mesh;
  private readonly moonHalo: THREE.Mesh;
  private readonly stars: THREE.Points;
    private starMaterial!: THREE.PointsMaterial;
  private readonly clouds: Array<{ group: THREE.Group; speed: number; drift: number }> = [];
  private readonly fog = new THREE.Fog(0xf3e2cf, 45, 130);
  private readonly sunPosition = new THREE.Vector3();
  private readonly moonPosition = new THREE.Vector3();
  private readonly palette = {
    top: new THREE.Color(),
    bottom: new THREE.Color(),
    sun: new THREE.Color(),
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    fog: new THREE.Color()
  };

  constructor(scene: THREE.Scene) {
    scene.fog = this.fog;

    this.uniforms = {
      topColor: { value: new THREE.Color(0x9fc4dd) },
      bottomColor: { value: new THREE.Color(0xffe3c4) },
      sunColor: { value: new THREE.Color(0xffe8c8) },
      sunDirection: { value: new THREE.Vector3(0.3, 0.8, 0.4) },
      sunGlow: { value: 0.55 }
    };

    this.dome = new THREE.Mesh(
      new THREE.SphereGeometry(140, 32, 20),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false
      })
    );
    this.dome.renderOrder = -100;
    this.group.add(this.dome);

    this.stars = this.buildStars();
    this.group.add(this.stars);

    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 18, 14),
      new THREE.MeshBasicMaterial({ color: 0xfff2d4, fog: false })
    );
    this.group.add(this.sunMesh);

    this.moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 18, 14),
      new THREE.MeshBasicMaterial({ color: 0xfdf6ea, fog: false })
    );
    this.group.add(this.moonMesh);

    this.moonHalo = new THREE.Mesh(
      new THREE.SphereGeometry(3.1, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xfff4e2,
        transparent: true,
        opacity: 0.14,
        fog: false,
        depthWrite: false
      })
    );
    this.group.add(this.moonHalo);

    for (let i = 0; i < 7; i += 1) {
      const cloud = this.buildCloud();
      const angle = (i / 7) * Math.PI * 2;
      const radius = 34 + Math.random() * 18;
      cloud.group.position.set(
        Math.cos(angle) * radius,
        9 + Math.random() * 8,
        Math.sin(angle) * radius
      );
      cloud.group.scale.setScalar(0.85 + Math.random() * 0.7);
      this.clouds.push({
        group: cloud.group,
        speed: 0.12 + Math.random() * 0.18,
        drift: angle
      });
      this.group.add(cloud.group);
    }

    this.sunLight = new THREE.DirectionalLight(0xfff1d8, 1.9);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.left = -22;
        this.sunLight.shadow.camera.right = 22;
        this.sunLight.shadow.camera.top = 22;
        this.sunLight.shadow.camera.bottom = -22;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 80;
    this.sunLight.shadow.bias = -0.0012;
    this.sunLight.shadow.normalBias = 0.02;
    this.sunLight.target.position.set(0, 0, 0);
    scene.add(this.sunLight, this.sunLight.target);

    this.moonLight = new THREE.DirectionalLight(0xb8c7f2, 0.4);
    scene.add(this.moonLight);

    this.hemi = new THREE.HemisphereLight(0xe4f1f7, 0xcfd9b6, 1);
    scene.add(this.hemi);

    this.ambient = new THREE.AmbientLight(0xfff4e6, 0.5);
    scene.add(this.ambient);

    scene.add(this.group);
  }

  private buildStars(): THREE.Points {
    const count = 340;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9);
      const radius = 110;
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xfff8e8,
      size: 0.75,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geometry, material);
        this.starMaterial = material;
        return points;
      }

      private buildCloud(): { group: THREE.Group } {
        const group = new THREE.Group();
    const material = new THREE.MeshToonMaterial({
      color: 0xfffaf2,
      transparent: true,
      opacity: 0.92,
      fog: false
    });
    const puffs: Array<[number, number, number, number]> = [
      [0, 0, 0, 1.4],
      [1.5, -0.15, 0.2, 1.0],
      [-1.4, -0.2, -0.1, 0.85],
      [0.5, 0.45, -0.3, 0.9]
    ];
    for (const [x, y, z, radius] of puffs) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 9), material);
      puff.position.set(x, y, z);
      puff.scale.set(1.3, 0.72, 1);
      group.add(puff);
    }
    return { group };
  }

  update(dt: number, time01: number, cameraPosition: THREE.Vector3, focus?: THREE.Vector3): void {
    this.samplePalette(time01);

    this.uniforms.topColor.value.copy(this.palette.top);
    this.uniforms.bottomColor.value.copy(this.palette.bottom);
    this.uniforms.sunColor.value.copy(this.palette.sun);

    const sunAngle = (time01 - 0.25) * Math.PI * 2;
    this.sunPosition.set(
      Math.cos(sunAngle) * 62,
      Math.sin(sunAngle) * 54,
      Math.cos(sunAngle * 0.5) * 26
    );
    this.moonPosition.copy(this.sunPosition).multiplyScalar(-1);

    this.sunMesh.position.copy(this.sunPosition).multiplyScalar(0.86);
    this.moonMesh.position.copy(this.moonPosition).multiplyScalar(0.86);
    this.moonHalo.position.copy(this.moonMesh.position);

    this.uniforms.sunDirection.value.copy(this.sunPosition).normalize();
    const daylight = THREE.MathUtils.clamp(Math.sin(sunAngle) * 1.6 + 0.25, 0, 1);
    this.uniforms.sunGlow.value = 0.22 + daylight * 0.78;

        // Shadows follow the player so a 34-unit island keeps a crisp shadow map.
        const focusPoint = focus ?? this.sunLight.target.position;
        this.sunLight.target.position.copy(focusPoint);
        this.sunLight.target.updateMatrixWorld();
        this.sunLight.position
          .copy(focusPoint)
          .addScaledVector(this.uniforms.sunDirection.value, 60);
        this.moonLight.position
          .copy(focusPoint)
          .addScaledVector(this.moonPosition.clone().normalize(), 60);

        const key = this.sampleKey(time01);
        this.sunLight.color.copy(this.palette.sun);
        this.sunLight.intensity = key.sunIntensity * THREE.MathUtils.clamp(daylight * 2.2, 0, 1);
    this.moonLight.intensity = (1 - daylight) * 0.55;
    this.hemi.color.copy(this.palette.hemiSky);
    this.hemi.groundColor.copy(this.palette.hemiGround);
    this.hemi.intensity = key.hemiIntensity;
    this.ambient.intensity = key.ambient;
    this.fog.color.copy(this.palette.fog);

    const night = 1 - daylight;
    this.starMaterial.opacity = THREE.MathUtils.clamp(night * 1.35 - 0.15, 0, 0.95);
    this.stars.rotation.y = time01 * Math.PI * 0.35;
        this.moonMesh.visible = night > 0.05;
    this.moonHalo.visible = this.moonMesh.visible;
    this.sunMesh.visible = daylight > 0.02;

    for (const cloud of this.clouds) {
      cloud.drift += dt * cloud.speed * 0.02;
      cloud.group.position.x = Math.cos(cloud.drift) * 44;
      cloud.group.position.z = Math.sin(cloud.drift * 0.8) * 40;
      cloud.group.visible = daylight > 0.12;
    }

    this.dome.position.set(cameraPosition.x, 0, cameraPosition.z);
    this.dome.rotation.y = time01 * 0.1;
    this.stars.position.copy(this.dome.position);
  }

  private sampleKey(time01: number): SkyKeyframe {
    const t = ((time01 % 1) + 1) % 1;
    for (let i = 0; i < KEYS.length - 1; i += 1) {
      const a = KEYS[i];
      const b = KEYS[i + 1];
      if (t >= a.t && t <= b.t) {
        const local = (t - a.t) / Math.max(0.0001, b.t - a.t);
        const eased = local * local * (3 - 2 * local);
        return {
          t,
          top: a.top,
          bottom: a.bottom,
          sun: a.sun,
          sunIntensity: THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, eased),
          hemiSky: a.hemiSky,
          hemiGround: a.hemiGround,
          hemiIntensity: THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, eased),
          fog: a.fog,
          ambient: THREE.MathUtils.lerp(a.ambient, b.ambient, eased)
        };
      }
    }
    return KEYS[0];
  }

  private samplePalette(time01: number): void {
    const t = ((time01 % 1) + 1) % 1;
    for (let i = 0; i < KEYS.length - 1; i += 1) {
      const a = KEYS[i];
      const b = KEYS[i + 1];
      if (t >= a.t && t <= b.t) {
        const local = (t - a.t) / Math.max(0.0001, b.t - a.t);
        const eased = local * local * (3 - 2 * local);
        this.palette.top.setHex(a.top).lerp(new THREE.Color(b.top), eased);
        this.palette.bottom.setHex(a.bottom).lerp(new THREE.Color(b.bottom), eased);
        this.palette.sun.setHex(a.sun).lerp(new THREE.Color(b.sun), eased);
        this.palette.hemiSky.setHex(a.hemiSky).lerp(new THREE.Color(b.hemiSky), eased);
        this.palette.hemiGround.setHex(a.hemiGround).lerp(new THREE.Color(b.hemiGround), eased);
        this.palette.fog.setHex(a.fog).lerp(new THREE.Color(b.fog), eased);
        return;
      }
    }
  }

  setShadowQuality(enabled: boolean, mapSize: number): void {
    this.sunLight.castShadow = enabled;
    if (this.sunLight.shadow.mapSize.width !== mapSize) {
      this.sunLight.shadow.mapSize.set(mapSize, mapSize);
      this.sunLight.shadow.map?.dispose();
      this.sunLight.shadow.map = null;
    }
  }

  /** 0 = deep night, 1 = full daylight. Used by fireflies, petals and lamps. */
  daylightAt(time01: number): number {
    const sunAngle = (time01 - 0.25) * Math.PI * 2;
    return THREE.MathUtils.clamp(Math.sin(sunAngle) * 1.6 + 0.25, 0, 1);
  }

  getSunDirection(): THREE.Vector3 {
    return this.uniforms.sunDirection.value;
  }
}

const PHASES: Array<{ from: number; phase: SkyState['phase'] }> = [
  { from: 0.22, phase: 'morning' },
  { from: 0.42, phase: 'afternoon' },
  { from: 0.68, phase: 'evening' },
  { from: 0.86, phase: 'night' },
  { from: 1.01, phase: 'night' }
];

export class DayNightClock {
  time: number;
  day = 1;

  constructor(startTime = 0.2, private readonly dayLength = 300) {
    this.time = startTime;
  }

  tick(dt: number): void {
    this.time += dt / this.dayLength;
    if (this.time >= 1) {
      this.time -= 1;
      this.day += 1;
    }
  }

  get hour(): number {
    return this.time * 24;
  }

  get phase(): SkyState['phase'] {
    for (const entry of PHASES) {
      if (this.time < entry.from) return entry.phase;
    }
    return 'night';
  }

  setTime(time: number): void {
    this.time = ((time % 1) + 1) % 1;
  }
}