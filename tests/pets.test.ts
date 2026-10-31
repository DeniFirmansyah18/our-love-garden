import { describe, expect, it } from 'vitest';
import {
  applyAffection,
  canFeedPet,
  feedAffection,
  isFavoriteFood,
  petAffection,
  talkToPet
} from '../src/systems/pets';

describe('pet affection', () => {
  it('gains affection from talking, petting and feeding', () => {
    expect(talkToPet(0)).toBe(2);
    expect(petAffection(0)).toBe(4);
    expect(feedAffection(0, true)).toBe(8);
    expect(feedAffection(0, false)).toBe(3);
  });

  it('caps affection at 100', () => {
    expect(petAffection(98)).toBe(100);
    expect(feedAffection(96, true)).toBe(100);
  });

  it('reports level-ups at 25-point thresholds', () => {
    expect(applyAffection(0, 26)).toEqual({ level: 1, leveledUp: true });
    expect(applyAffection(24, 30)).toEqual({ level: 1, leveledUp: true });
    expect(applyAffection(25, 30)).toEqual({ level: 1, leveledUp: false });
    expect(applyAffection(74, 79)).toEqual({ level: 3, leveledUp: true });
  });
});

describe('pet feeding rules', () => {
  it('matches each pet to its favourite food', () => {
    expect(isFavoriteFood('cimoy', 'ikan-mas')).toBe(true);
    expect(isFavoriteFood('jamal', 'stroberi')).toBe(true);
    expect(isFavoriteFood('anak-ayam', 'wortel')).toBe(true);
    expect(isFavoriteFood('cimoy', 'wortel')).toBe(false);
  });

  it('only accepts known foods', () => {
    expect(canFeedPet('cimoy', 'ikan-mas')).toBe(true);
    expect(canFeedPet('cimoy', 'mawar')).toBe(true);
    expect(canFeedPet('cimoy', 'sepatu-bekas')).toBe(false);
    expect(canFeedPet('cimoy', 'benda-gaib')).toBe(false);
  });
});