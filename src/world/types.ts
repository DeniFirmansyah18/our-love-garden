import type * as THREE from 'three';

export interface Collider {
  x: number;
  z: number;
  radius: number;
}

export interface DistrictPiece {
  group: THREE.Group;
  update?: (dt: number, time: number) => void;
  colliders?: Collider[];
}