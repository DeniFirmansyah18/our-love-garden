import { describe, expect, it } from 'vitest';
import { DEFAULT_SOUND, clampVolume, sanitizeSound } from '../src/audio/settings';
import { defaultSave, loadSave, sanitizeSave, writeSave, type StorageLike } from '../src/save/save';

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    }
  };
}

describe('volume', () => {
  it('clamps into 0..1', () => {
    expect(clampVolume(-2)).toBe(0);
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(0.35)).toBeCloseTo(0.35);
  });

  it('falls back when the value is nonsense', () => {
    expect(clampVolume('loud')).toBe(DEFAULT_SOUND.volume);
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_SOUND.volume);
    expect(clampVolume(undefined, 0.4)).toBe(0.4);
  });
});

describe('sound settings', () => {
  it('defaults when fields are missing', () => {
    expect(sanitizeSound(undefined)).toEqual(DEFAULT_SOUND);
    expect(sanitizeSound({})).toEqual(DEFAULT_SOUND);
  });

  it('keeps valid toggles and clamps volume', () => {
    expect(sanitizeSound({ volume: 0.2, music: false, sfx: true })).toEqual({
      volume: 0.2,
      music: false,
      sfx: true
    });
    expect(sanitizeSound({ volume: 5, music: 'yes', sfx: 0 })).toEqual({
      volume: 1,
      music: true,
      sfx: true
    });
  });
});

describe('save with sound', () => {
  it('starts with music and effects on, volume at 0.6', () => {
    const save = defaultSave();
    expect(save.sound).toEqual(DEFAULT_SOUND);
    expect(save.version).toBe(4);
  });

  it('upgrades a version 3 save that has no sound block', () => {
    const legacy = {
      version: 3,
      lang: 'en',
      quality: 'sharp',
      loadout: { bubu: { accessory: 'scarf', ribbon: 'cream' }, dudu: { accessory: 'bowtie' } },
      progress: { coins: 12, memories: [] }
    };
    const save = sanitizeSave(legacy);
    expect(save.sound).toEqual(DEFAULT_SOUND);
    expect(save.lang).toBe('en');
    expect(save.quality).toBe('sharp');
    expect(save.progress.coins).toBe(12);
  });

  it('round trips volume and toggles', () => {
    const storage = memoryStorage();
    const save = defaultSave();
    save.sound = { volume: 0.15, music: false, sfx: false };
    writeSave(save, storage);
    const loaded = loadSave(storage);
    expect(loaded.sound).toEqual({ volume: 0.15, music: false, sfx: false });
  });
});