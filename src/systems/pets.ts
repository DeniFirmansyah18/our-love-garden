import { petById } from '../data/pets';

export const MAX_AFFECTION = 100;
/** Affection gained per pet/favourably-fed interaction. */
const PET_GAIN = 4;
const FEED_FAVORITE_GAIN = 8;
const FEED_REGULAR_GAIN = 3;
const CHAT_GAIN = 2;

export interface AffectionChange {
  level: number;
  /** True when this interaction crossed a 25-point threshold. */
  leveledUp: boolean;
}

function levelOf(affection: number): number {
  return Math.min(3, Math.floor(affection / 25));
}

export function talkToPet(affection: number): number {
  return Math.min(MAX_AFFECTION, affection + CHAT_GAIN);
}

export function petAffection(affection: number): number {
  return Math.min(MAX_AFFECTION, affection + PET_GAIN);
}

export function feedAffection(affection: number, favorite: boolean): number {
  return Math.min(MAX_AFFECTION, affection + (favorite ? FEED_FAVORITE_GAIN : FEED_REGULAR_GAIN));
}

/**
 * Applies a gain and reports whether a pet's closeness level crossed a
 * threshold. Levels: 0 (baru kenal), 1 (teman), 2 (dekat), 3 (sahabat).
 */
export function applyAffection(
  current: number,
  next: number,
  onChange?: (affection: number, change: AffectionChange) => void
): AffectionChange {
  const before = levelOf(Math.max(0, current));
  const after = levelOf(Math.min(MAX_AFFECTION, next));
  const change: AffectionChange = { level: after, leveledUp: after > before };
  onChange?.(Math.min(MAX_AFFECTION, next), change);
  return change;
}

/** Which inventory items this pet will accept as food. */
export function canFeedPet(petId: string, itemId: string): boolean {
  const pet = petById(petId);
  if (!pet) return false;
  return itemId === pet.favoriteFood || itemId === 'mawar' || itemId === 'wortel' || itemId === 'stroberi' || itemId === 'ikan-mas';
}

export function isFavoriteFood(petId: string, itemId: string): boolean {
  const pet = petById(petId);
  return pet ? pet.favoriteFood === itemId : false;
}