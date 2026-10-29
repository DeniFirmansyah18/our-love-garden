import * as THREE from 'three';

export const OUTLINE_COLOR = 0x4a1f1a;
export const OUTLINE_MATERIAL = new THREE.MeshBasicMaterial({
  color: OUTLINE_COLOR,
  side: THREE.BackSide
});

let gradientMap: THREE.DataTexture | null = null;

/** Three-step ramp keeps the low-poly look flat and soft instead of plasticky. */
export function toonGradient(): THREE.DataTexture {
  if (gradientMap) return gradientMap;
  const steps = new Uint8Array([132, 196, 240, 255]);
  gradientMap = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.generateMipmaps = false;
  gradientMap.needsUpdate = true;
  return gradientMap;
}

export function toonMaterial(
  color: THREE.ColorRepresentation,
  options: { emissive?: THREE.ColorRepresentation; emissiveIntensity?: number } = {}
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient(),
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 1
  });
}

export function flatMaterial(color: THREE.ColorRepresentation): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color });
}

/**
 * Inverted-hull outline: a slightly larger back-face copy of the same geometry.
 * Cheaper and steadier than a post-process pass for a handful of characters.
 */
export function outline(mesh: THREE.Mesh, thickness = 1.06): THREE.Mesh {
  const shell = new THREE.Mesh(mesh.geometry, OUTLINE_MATERIAL);
  shell.scale.setScalar(thickness);
  shell.castShadow = false;
  shell.receiveShadow = false;
  shell.renderOrder = -1;
  mesh.add(shell);
  return shell;
}

export function outlined<T extends THREE.Mesh>(mesh: T, thickness = 1.06): T {
  outline(mesh, thickness);
  return mesh;
}

const sphereCache = new Map<string, THREE.SphereGeometry>();

export function sphereGeometry(radius: number, segments = 18): THREE.SphereGeometry {
  const key = `${radius}:${segments}`;
  const cached = sphereCache.get(key);
  if (cached) return cached;
  const geometry = new THREE.SphereGeometry(radius, segments, Math.max(10, Math.round(segments * 0.7)));
  sphereCache.set(key, geometry);
  return geometry;
}

export function makeSphere(
  radius: number,
  color: THREE.ColorRepresentation,
  segments = 18,
  outlineScale = 1.05
): THREE.Mesh {
  const mesh = new THREE.Mesh(sphereGeometry(radius, segments), toonMaterial(color));
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  if (outlineScale > 0) outline(mesh, outlineScale);
  return mesh;
}

/** A gently domed decal so the face hugs the head instead of floating flat. */
export function domeGeometry(width: number, height: number, bulge = 0.16): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, 12, 12);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i) / (width * 0.5);
    const y = position.getY(i) / (height * 0.5);
    const falloff = Math.max(0, 1 - x * x) * Math.max(0, 1 - y * y);
    position.setZ(i, bulge * falloff);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.geometry && !isCachedGeometry(mesh.geometry)) mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
    else if (material && material !== OUTLINE_MATERIAL) material.dispose();
  });
}

function isCachedGeometry(geometry: THREE.BufferGeometry): boolean {
  return Array.from(sphereCache.values()).includes(geometry as THREE.SphereGeometry);
}