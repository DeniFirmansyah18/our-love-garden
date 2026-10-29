import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SAVE,
  PLOT_COUNT,
  STARTING_COINS,
  addItem,
  clearSave,
  defaultSave,
  loadSave,
  parseSave,
  sanitizeSave,
  writeSave,
  type StorageLike
} from '../src/save/save';

function memoryStorage(initial?: string): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set('our-love-garden:save', initial);
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

describe('save defaults', () => {
  it('starts from a fresh default state', () => {
    const state = defaultSave();
    expect(state.version).toBe(DEFAULT_SAVE.version);
    expect(state.lang).toBe('id');
    expect(state.quality).toBe('auto');
    expect(state.loadout.bubu.accessory).toBe('straw');
  });

  it('returns independent copies so edits do not leak into defaults', () => {
    const first = defaultSave();
    first.loadout.bubu.ribbon = 'cream';
    const second = defaultSave();
    expect(second.loadout.bubu.ribbon).toBe('rose');
  });

  it('falls back to defaults when storage is empty or unavailable', () => {
    const empty = memoryStorage();
    expect(loadSave(empty).lang).toBe('id');
    expect(loadSave(null as unknown as StorageLike).lang).toBe('id');
  });
});

describe('save parsing', () => {
  it('survives corrupt JSON', () => {
    expect(parseSave('{not json').loadout.bubu.accessory).toBe('straw');
    expect(parseSave('null').quality).toBe('auto');
    expect(parseSave(null).version).toBe(DEFAULT_SAVE.version);
  });

  it('drops unknown values instead of writing them back', () => {
    const state = sanitizeSave({
      lang: 'fr',
      quality: 'ultra',
      loadout: {
        bubu: { accessory: 'jetpack', ribbon: 'neon' },
        dudu: { accessory: 'flower-crown' }
      }
    });
    expect(state.lang).toBe('id');
    expect(state.quality).toBe('auto');
    expect(state.loadout.bubu.accessory).toBe('straw');
    expect(state.loadout.bubu.ribbon).toBe('rose');
    expect(state.loadout.dudu.accessory).toBe('flower-crown');
  });

  it('keeps valid customization choices', () => {
    const state = sanitizeSave({
      lang: 'en',
      quality: 'saver',
      loadout: {
        bubu: { accessory: 'glasses', ribbon: 'cocoa' },
        dudu: { accessory: 'bowtie' }
      }
    });
    expect(state.lang).toBe('en');
    expect(state.quality).toBe('saver');
    expect(state.loadout.bubu.accessory).toBe('glasses');
    expect(state.loadout.bubu.ribbon).toBe('cocoa');
    expect(state.loadout.dudu.accessory).toBe('bowtie');
  });
});

describe('save round trip', () => {
  it('writes and reads the same state', () => {
    const storage = memoryStorage();
    const state = defaultSave();
    state.lang = 'en';
    state.quality = 'sharp';
    state.loadout.dudu.accessory = 'leaf-hat';

    expect(writeSave(state, storage)).toBe(true);
    const loaded = loadSave(storage);
    expect(loaded.lang).toBe('en');
    expect(loaded.quality).toBe('sharp');
    expect(loaded.loadout.dudu.accessory).toBe('leaf-hat');
  });

  it('starts with coins, empty plots and the three animals', () => {
    const progress = defaultSave().progress;
    expect(progress.coins).toBe(STARTING_COINS);
    expect(progress.plots).toHaveLength(PLOT_COUNT);
    expect(progress.plots.every((plot) => plot.cropId === null)).toBe(true);
    expect(progress.collection.animals).toEqual(['cimoy', 'jamal', 'anak-ayam']);
    expect(progress.animalNames.cimoy).toBe('Cimoy');
      expect(progress.memories).toEqual([]);
      expect(progress.finaleSeen).toBe(false);
      expect(progress.birthdaySeen).toEqual([]);
    });

    it('keeps memory progress and birthday flags', () => {
      const storage = memoryStorage();
      const state = defaultSave();
      state.progress.memories = ['awal', 'hujan'];
      state.progress.finaleSeen = true;
      state.progress.birthdaySeen = ['2026-bubu'];
      writeSave(state, storage);
      const loaded = loadSave(storage, {
        knownIds: { crops: ['mawar'], fish: ['jamal'], animals: [], memories: ['awal', 'hujan', 'makan'] }
      });
      expect(loaded.progress.memories).toEqual(['awal', 'hujan']);
      expect(loaded.progress.finaleSeen).toBe(true);
      expect(loaded.progress.birthdaySeen).toEqual(['2026-bubu']);
    });

    it('drops unknown memory ids from a save', () => {
      const state = sanitizeSave(
        { progress: { memories: ['awal', 'palsu', 7], finaleSeen: 'yes', birthdaySeen: ['x', 3] } },
        Date.now(),
        { crops: [], fish: [], animals: [], memories: ['awal'] }
      );
      expect(state.progress.memories).toEqual(['awal']);
      expect(state.progress.finaleSeen).toBe(false);
      expect(state.progress.birthdaySeen).toEqual(['x']);
    });

  it('keeps plot growth and inventory across a reload', () => {
    const storage = memoryStorage();
    const state = defaultSave();
    state.progress.coins = 210;
    state.progress.plots[0] = {
      cropId: 'mawar',
      growthMs: 12_000,
      lastTickMs: 1_700_000_000_000,
      wateredUntilMs: 1_700_000_060_000
    };
    state.progress.inventory = { mawar: 3, 'koi-krem': 1 };
    state.progress.collection.fish = ['koi-krem'];
    state.progress.animalNames.cimoy = 'Cimoii';

    writeSave(state, storage);
    const loaded = loadSave(storage);
    expect(loaded.progress.coins).toBe(210);
    expect(loaded.progress.plots[0].cropId).toBe('mawar');
    expect(loaded.progress.plots[0].growthMs).toBe(12_000);
    expect(loaded.progress.inventory).toEqual({ mawar: 3, 'koi-krem': 1 });
    expect(loaded.progress.collection.fish).toContain('koi-krem');
    expect(loaded.progress.animalNames.cimoy).toBe('Cimoii');
  });

  it('repairs broken progress data', () => {
    const raw = {
      progress: {
        coins: -12,
        plots: [{ cropId: 'mawar', growthMs: -5, lastTickMs: 'x', wateredUntilMs: null }],
        inventory: { mawar: 2.7, rusak: 'banyak', hilang: 0 },
        collection: { fish: ['koi-krem', 42, 'ikan-hantu'], crops: ['mawar'], animals: [] },
        animalNames: { cimoy: '   ', jamal: 'Jaamal!', asing: 'x' }
      }
    };
    const state = sanitizeSave(raw, 1_700_000_000_000, {
      crops: ['mawar'],
      fish: ['koi-krem'],
      animals: ['cimoy', 'jamal', 'anak-ayam']
    });
    expect(state.progress.coins).toBe(0);
    expect(state.progress.plots).toHaveLength(PLOT_COUNT);
    expect(state.progress.plots[0].growthMs).toBe(0);
    expect(state.progress.inventory).toEqual({ mawar: 2 });
    expect(state.progress.collection.fish).toEqual(['koi-krem']);
    expect(state.progress.collection.animals).toEqual(['cimoy', 'jamal', 'anak-ayam']);
    expect(state.progress.animalNames.cimoy).toBe('Cimoy');
    expect(state.progress.animalNames.jamal).toBe('Jaamal!');
  });

  it('adds and removes items without leaving zero counts', () => {
    const bag: Record<string, number> = {};
    addItem(bag, 'mawar', 2);
    addItem(bag, 'mawar', 1);
    expect(bag.mawar).toBe(3);
    addItem(bag, 'mawar', -3);
    expect(bag.mawar).toBeUndefined();
  });

  it('clears stored progress', () => {
    const storage = memoryStorage();
    writeSave(defaultSave(), storage);
    clearSave(storage);
    expect(storage.data.size).toBe(0);
  });

  it('reports failure when storage throws', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => undefined
    };
    expect(writeSave(defaultSave(), broken)).toBe(false);
    expect(loadSave(broken).lang).toBe('id');
  });
});