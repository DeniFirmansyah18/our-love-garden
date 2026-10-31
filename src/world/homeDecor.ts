import * as THREE from 'three';
import { DECOR_SLOTS, decorById, type DecorState } from '../data/decor';
import { fishById } from '../data/fish';
import { disposeObject } from '../entities/toon';
import { buildDecorItem, type InteriorProp } from './interior';
import type { Collider } from './types';

/**
 * Data-driven front-yard furniture. Reads the save's decor state and rebuilds
 * the yard whenever the player buys, moves, stores, or configures a piece.
 */
export class HomeDecor {
  readonly group = new THREE.Group();
  colliders: Collider[] = [];
  private readonly props: InteriorProp[] = [];
  private readonly slotByGroup = new WeakMap<THREE.Object3D, number>();

  sync(state: DecorState, photos: readonly string[]): void {
    this.clear();
    this.colliders = [];

    for (const placement of state.placed) {
      const slot = DECOR_SLOTS[placement.slot];
      const def = decorById(placement.item);
      if (!slot || !def) continue;

      const prop = buildDecorItem(
        placement.item,
        { x: slot.x, z: slot.z },
        slot.rotation,
        {
          photo: def.special === 'photo' ? photos[placement.photo] ?? null : null,
          fishColor: def.special === 'fish' ? this.fishBody(placement.fish) : null,
          finColor: def.special === 'fish' ? this.fishFin(placement.fish) : undefined
        }
      );

      this.props.push(prop);
      this.group.add(prop.group);
      this.slotByGroup.set(prop.group, placement.slot);

      if (def.collider > 0) {
        this.colliders.push({ x: slot.x, z: slot.z, radius: def.collider });
      }
    }
  }

  /** Resolves a raycaster hit back to its yard slot, or null when unrelated. */
  slotFromObject(object: THREE.Object3D): number | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      const slot = this.slotByGroup.get(node);
      if (slot !== undefined) return slot;
      node = node.parent;
    }
    return null;
  }

  update(_dt: number, time: number): void {
    for (const prop of this.props) prop.update?.(time);
  }

  setNight(amount: number): void {
    for (const prop of this.props) prop.setNight?.(amount);
  }

  dispose(): void {
    this.clear();
  }

  private fishBody(fishId: string | null): number | null {
    if (!fishId) return null;
    return fishById(fishId)?.bodyColor ?? null;
  }

  private fishFin(fishId: string | null): number | undefined {
    if (!fishId) return undefined;
    return fishById(fishId)?.finColor;
  }

  private clear(): void {
    for (const prop of this.props) {
      this.group.remove(prop.group);
      disposeObject(prop.group);
    }
    this.props.length = 0;
  }
}