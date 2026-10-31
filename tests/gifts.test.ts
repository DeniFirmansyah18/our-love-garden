import { describe, expect, it } from 'vitest';
import { giftResult, isDuduFavorite, isGiftable } from '../src/data/gifts';

describe('gift gating', () => {
  it('crops and fish are giftable, junk and unknown ids are not', () => {
    expect(isGiftable('mawar')).toBe(true);
    expect(isGiftable('koi-hati')).toBe(true);
    expect(isGiftable('sepatu-bekas')).toBe(false);
    expect(isGiftable('barang-gaib')).toBe(false);
  });

  it('marks favourites and only flags the first time each one is gifted', () => {
    expect(isDuduFavorite('mawar')).toBe(true);
    expect(isDuduFavorite('wortel')).toBe(false);

    expect(giftResult('mawar', [])).toEqual({ favorite: true, firstFavorite: true });
    expect(giftResult('mawar', ['mawar'])).toEqual({ favorite: true, firstFavorite: false });
    expect(giftResult('wortel', [])).toEqual({ favorite: false, firstFavorite: false });
    expect(giftResult('sepatu-bekas', [])).toBeNull();
  });
});