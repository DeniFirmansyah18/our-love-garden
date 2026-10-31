import { describe, expect, it } from 'vitest';
import {
  BIRTHDAYS,
  FLOWER_CROWN_MEMORIES,
  MEMORIES,
  MEMORY_COUNT,
  birthdayOn,
  daysUntilBirthday,
  memoryById,
  nextMemoryHint,
  unlockedDuduAccessories
} from '../src/data/memories';

describe('memory chests', () => {
  it('has seven unique chests with letters and hints', () => {
    expect(MEMORY_COUNT).toBe(7);
    const ids = new Set(MEMORIES.map((memory) => memory.id));
    expect(ids.size).toBe(MEMORY_COUNT);
    for (const memory of MEMORIES) {
      expect(memory.letter.id.length).toBeGreaterThan(20);
      expect(memory.letter.en.length).toBeGreaterThan(20);
      expect(memory.hint.id.length).toBeGreaterThan(4);
      expect(memory.position.x).toBeGreaterThan(-33);
            expect(memory.position.x).toBeLessThan(33);
            expect(memory.position.z).toBeGreaterThan(-33);
            expect(memory.position.z).toBeLessThan(33);
            expect(Math.hypot(memory.position.x, memory.position.z)).toBeLessThan(33);
            expect(Math.hypot(memory.position.x - 0, memory.position.z + 16)).toBeGreaterThan(7.4);
    }
  });

  it('finds chests by id', () => {
    expect(memoryById('awal')?.index).toBe(1);
    expect(memoryById('nope')).toBeUndefined();
  });

  it('points at the first unopened chest', () => {
    expect(nextMemoryHint([])?.id).toBe('awal');
    expect(nextMemoryHint(['awal', 'hujan'])?.id).toBe('makan');
    expect(nextMemoryHint(MEMORIES.map((memory) => memory.id))).toBeNull();
  });

  it('unlocks the flower crown after four memories', () => {
    expect(unlockedDuduAccessories(0)).toEqual([]);
    expect(unlockedDuduAccessories(FLOWER_CROWN_MEMORIES - 1)).toEqual([]);
    expect(unlockedDuduAccessories(FLOWER_CROWN_MEMORIES)).toEqual(['flower-crown']);
    expect(unlockedDuduAccessories(7)).toEqual(['flower-crown']);
  });
});

describe('birthdays', () => {
  it('matches Bubu on 12 July', () => {
    const event = birthdayOn(new Date(2026, 6, 12));
    expect(event?.character).toBe('bubu');
    expect(event?.name).toBe('Jihan');
  });

  it('matches Dudu on 18 October', () => {
    const event = birthdayOn(new Date(2026, 9, 18));
    expect(event?.character).toBe('dudu');
    expect(event?.name).toBe('Deni');
  });

  it('is quiet on an ordinary day', () => {
    expect(birthdayOn(new Date(2026, 0, 3))).toBeNull();
  });

  it('counts down to the next birthday, wrapping the year', () => {
    const bubu = BIRTHDAYS[0];
    expect(daysUntilBirthday(new Date(2026, 6, 12), bubu)).toBe(0);
    expect(daysUntilBirthday(new Date(2026, 6, 11), bubu)).toBe(1);
    expect(daysUntilBirthday(new Date(2026, 6, 13), bubu)).toBe(364);
    expect(daysUntilBirthday(new Date(2026, 11, 31), bubu)).toBe(193);
  });
});