import { cropById } from './crops';
import { fishById } from './fish';

/**
 * Which harvests and catches Bubu can hand to Dudu. Junk stays sellable but is
 * not a gift: the point is the romantic exchange, not regifting a shoe.
 */
export function isGiftable(itemId: string): boolean {
  return Boolean(cropById(itemId) ?? fishById(itemId));
}

/** Items Dudu melts for. Giving one unlocks his special first-time reply. */
export const DUDU_FAVORITES: string[] = [
  'mawar',
  'stroberi',
  'matahari',
  'lavender',
  'bunga-rahasia',
  'terong',
  'koi-hati',
  'ikan-mas'
];

export function isDuduFavorite(itemId: string): boolean {
  return DUDU_FAVORITES.includes(itemId);
}

export interface GiftResult {
  favorite: boolean;
  /** True only the first time a specific favorite is gifted. */
  firstFavorite: boolean;
}

/**
 * Pure outcome of handing `itemId` to Dudu, given the favourites already
 * gifted. Returns null when the item cannot be gifted at all.
 */
export function giftResult(itemId: string, previouslyFavorited: string[]): GiftResult | null {
  if (!isGiftable(itemId)) return null;
  const favorite = isDuduFavorite(itemId);
  const firstFavorite = favorite && !previouslyFavorited.includes(itemId);
  return { favorite, firstFavorite };
}