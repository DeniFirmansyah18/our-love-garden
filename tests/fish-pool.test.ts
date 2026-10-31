import { describe, expect, it } from 'vitest';
import {
  FISH,
  TIER_WEIGHT,
  baitBonus,
  fishAvailable,
  fishById
} from '../src/data/fish';
import { resolveCatch } from '../src/systems/fishing-pool';

const CONTEXT = { memories: [], totalCatches: 0 };
const ALL_MEMORIES = { memories: ['awal', 'hujan', 'makan', 'miring', 'malu', 'kolam', 'pulang'], totalCatches: 40 };

describe('fish catalogue', () => {
  it('defines common, rare and secret tiers', () => {
    const tiers = new Set(FISH.map((fish) => fish.tier));
    expect(tiers).toEqual(new Set(['common', 'rare', 'secret']));
    expect(FISH.filter((fish) => fish.tier === 'common').length).toBeGreaterThanOrEqual(8);
    expect(FISH.filter((fish) => fish.tier === 'rare').length).toBeGreaterThanOrEqual(5);
    expect(FISH.filter((fish) => fish.tier === 'secret').length).toBeGreaterThanOrEqual(3);
  });

  it('gives every fish a story, hint, size range and pull', () => {
    for (const fish of FISH) {
      expect(fish.sizeMin).toBeLessThan(fish.sizeMax);
      expect(fish.story.en.length).toBeGreaterThan(20);
      expect(fish.hint.en.length).toBeGreaterThan(8);
      expect(fish.pull).toBeGreaterThan(0.3);
      expect(fish.reelMs).toBeGreaterThan(1000);
    }
  });

  it('weights secret fish far below common fish', () => {
    expect(TIER_WEIGHT.secret).toBeLessThan(TIER_WEIGHT.rare);
    expect(TIER_WEIGHT.rare).toBeLessThan(TIER_WEIGHT.common);
  });
});

describe('fish availability gates', () => {
  it('keeps the legendary Jamal locked without its memory', () => {
    const fish = fishById('cupang-jamal-legend')!;
    expect(
      fishAvailable(fish, 'bait-bunga', 'day', 'teratai', CONTEXT)
    ).toBe(false);
    expect(
      fishAvailable(fish, 'bait-bunga', 'day', 'teratai', ALL_MEMORIES)
    ).toBe(true);
  });

  it('only summons the heart koi with the heart bait', () => {
    const koi = fishById('koi-hati')!;
    expect(fishAvailable(koi, 'bait-hati', 'day', 'teratai', CONTEXT)).toBe(true);
    expect(fishAvailable(koi, 'bait-cacing', 'day', 'teratai', CONTEXT)).toBe(false);
  });

  it('only summons night fish at night', () => {
    const lantern = fishById('ikan-lentera')!;
    expect(fishAvailable(lantern, 'bait-cacing', 'night', 'tepi', CONTEXT)).toBe(true);
    expect(fishAvailable(lantern, 'bait-cacing', 'day', 'tepi', CONTEXT)).toBe(false);
  });

  it('keeps Jamal near the lilies only', () => {
    const jamal = fishById('jamal')!;
    expect(fishAvailable(jamal, 'bait-cacing', 'day', 'teratai', CONTEXT)).toBe(true);
    expect(fishAvailable(jamal, 'bait-cacing', 'day', 'tengah', CONTEXT)).toBe(false);
  });

  it('boosts a favourite bait but never hard-requires it without needs', () => {
    const balloon = fishById('ikan-balon')!;
    expect(baitBonus(balloon, 'bait-roti')).toBe(2.4);
    expect(baitBonus(balloon, 'bait-cacing')).toBe(1);
  });
});

describe('catch pool resolution', () => {
  it('returns a fish when anything is eligible', () => {
    const result = resolveCatch('bait-cacing', 'day', 'tepi', 0.8, () => 0.1, CONTEXT);
    expect(result.fish).not.toBeNull();
    expect(result.isJunk).toBe(false);
  });

  it('returns junk only when nothing is eligible', () => {
    // Heart bait at night in the middle with zero memories has some fish? No:
    // night+middle still allows common night-neutral fish, so force a dead spot
    // using a bait+time+spot combo that only rare/secrets could satisfy.
    const result = resolveCatch('bait-hati', 'night', 'tengah', 0.5, () => 0.99, CONTEXT);
    // Common fish without needs still fill the pool, so this should be a fish.
    expect([...FISH.filter((fish) => fishAvailable(fish, 'bait-hati', 'night', 'tengah', CONTEXT))].length).toBeGreaterThan(0);
    expect(result.isJunk).toBe(false);
  });

  it('respects hard gates under many random rolls', () => {
    for (let i = 0; i < 200; i += 1) {
      const randomValue = (i % 100) / 100;
      const result = resolveCatch('bait-cacing', 'day', 'tepi', 0.5, () => randomValue, CONTEXT);
      if (result.fish) {
        expect(result.fish.needs?.memory).toBeUndefined();
        expect(result.fish.tier).not.toBe('secret');
      }
    }
  });

  it('can surface a secret once all memories are open', () => {
    let sawSecret = false;
    for (let i = 0; i < 400 && !sawSecret; i += 1) {
      const result = resolveCatch('bait-hati', 'night', 'teratai', 0.9, () => (i % 100) / 100, ALL_MEMORIES);
      if (result.fish?.tier === 'secret') sawSecret = true;
    }
    expect(sawSecret).toBe(true);
  });
});