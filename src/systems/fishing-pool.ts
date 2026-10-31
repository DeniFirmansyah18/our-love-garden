import {
  FISH,
  JUNK,
  TIER_WEIGHT,
  baitBonus,
  fishAvailable,
  fishById,
  type BaitId,
  type DayTime,
  type FishDef,
  type WaterSpot
} from '../data/fish';

export interface CatchResult {
  id: string;
  fish: FishDef | null;
  isJunk: boolean;
}

export interface CatchContext {
  memories: string[];
  totalCatches: number;
}

/**
 * Weighted pick of what bites right now. Bait/time/spot are hard gates; bait
 * preference, rarity and cast quality only shift the weights.
 */
export function resolveCatch(
  bait: BaitId,
  time: DayTime,
  spot: WaterSpot,
  castQuality: number,
  random: (() => number) | null,
  context: CatchContext
): CatchResult {
  const roll = random ?? Math.random;
  const eligible = FISH.filter((fish) => fishAvailable(fish, bait, time, spot, context));

  const junkWeight = eligibilityWeight(context, eligible.length);
  const totalFish = eligible.reduce(
    (sum, fish) =>
      sum + TIER_WEIGHT[fish.tier] * baitBonus(fish, bait) * (0.7 + castQuality * 0.6),
    0
  );
  const total = totalFish + junkWeight;

  const decision = roll() * total;
  if (junkWeight > 0 && decision < junkWeight) {
    return { id: JUNK[Math.floor(roll() * JUNK.length)].id, fish: null, isJunk: true };
  }

  let cursor = junkWeight;
  for (const fish of eligible) {
    cursor += TIER_WEIGHT[fish.tier] * baitBonus(fish, bait) * (0.7 + castQuality * 0.6);
    if (decision <= cursor) return { id: fish.id, fish, isJunk: false };
  }

  const fallback = eligible[0] ?? FISH[0];
  return { id: fallback.id, fish: fallback, isJunk: false };
}

/** Junk only if literally nothing is eligible, otherwise a rare 8% garnish. */
function eligibilityWeight(_context: CatchContext, eligibleCount: number): number {
  if (eligibleCount === 0) return 5;
  return 0.08 * 5;
}

export function defaultSpotResolver(power: number): WaterSpot {
  if (power < 0.5) return 'tepi';
  if (power < 0.8) return 'tengah';
  return 'teratai';
}

export function rollFishSize(fish: FishDef, random: (() => number) | null = Math.random): number {
  const roll = random ?? Math.random;
  return Math.round((fish.sizeMin + roll() * (fish.sizeMax - fish.sizeMin)) * 10) / 10;
}

export function fishByIdSafe(id: string): FishDef | undefined {
  return fishById(id);
}

export const BAND_CENTER = 0.62;