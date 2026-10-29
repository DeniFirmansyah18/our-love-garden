import {
  isBubuAccessory,
  isDuduAccessory,
  isLang,
  isQuality,
  isRibbon
} from '../data/config';
import type { BubuAccessory, DuduAccessory, Lang, Quality, RibbonId } from '../data/config';
import { DEFAULT_SOUND, sanitizeSound, type SoundSettings } from '../audio/settings';

export const SAVE_KEY = 'our-love-garden:save';
export const SAVE_VERSION = 4;
export const PLOT_COUNT = 9;
export const STARTING_COINS = 60;

export interface Loadout {
  bubu: {
    accessory: BubuAccessory;
    ribbon: RibbonId;
  };
  dudu: {
    accessory: DuduAccessory;
  };
}

export interface PlotState {
  cropId: string | null;
  /** Accumulated growth in milliseconds, capped at the crop's grow time. */
  growthMs: number;
  lastTickMs: number;
  wateredUntilMs: number;
}

export interface Progress {
  coins: number;
  plots: PlotState[];
  /** Item id (crop or fish) to count. */
  inventory: Record<string, number>;
  collection: {
    fish: string[];
    crops: string[];
    animals: string[];
  };
  animalNames: Record<string, string>;
  memories: string[];
    finaleSeen: boolean;
    birthdaySeen: string[];
  }

export interface SaveState {
  version: number;
  lang: Lang;
  quality: Quality;
  sound: SoundSettings;
  loadout: Loadout;
  progress: Progress;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const DEFAULT_SAVE: Omit<SaveState, 'progress'> = {
  version: SAVE_VERSION,
  lang: 'id',
  quality: 'auto',
  sound: { ...DEFAULT_SOUND },
  loadout: {
    bubu: { accessory: 'straw', ribbon: 'rose' },
    dudu: { accessory: 'none' }
  }
};

export const DEFAULT_ANIMAL_NAMES: Record<string, string> = {
  cimoy: 'Cimoy',
  jamal: 'Jamal',
  'anak-ayam': 'Kuning'
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function emptyPlot(now = 0): PlotState {
  return { cropId: null, growthMs: 0, lastTickMs: now, wateredUntilMs: 0 };
}

export function defaultProgress(now = 0): Progress {
  return {
    coins: STARTING_COINS,
    plots: Array.from({ length: PLOT_COUNT }, () => emptyPlot(now)),
    inventory: {},
    collection: {
      fish: [],
      crops: [],
      animals: ['cimoy', 'jamal', 'anak-ayam']
    },
    animalNames: { ...DEFAULT_ANIMAL_NAMES },
        memories: [],
        finaleSeen: false,
        birthdaySeen: []
      };
}

export function defaultSave(now = 0): SaveState {
  return {
    version: SAVE_VERSION,
    lang: DEFAULT_SAVE.lang,
    quality: DEFAULT_SAVE.quality,
    sound: { ...DEFAULT_SOUND },
    loadout: {
      bubu: { ...DEFAULT_SAVE.loadout.bubu },
      dudu: { ...DEFAULT_SAVE.loadout.dudu }
    },
    progress: defaultProgress(now)
  };
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizePlot(raw: unknown, now: number): PlotState {
  if (!isRecord(raw)) return emptyPlot(now);
  const cropId = typeof raw.cropId === 'string' && raw.cropId.length > 0 ? raw.cropId : null;
  if (!cropId) return emptyPlot(now);
  return {
    cropId,
    growthMs: Math.max(0, toNumber(raw.growthMs, 0)),
    lastTickMs: Math.max(0, toNumber(raw.lastTickMs, now)),
    wateredUntilMs: Math.max(0, toNumber(raw.wateredUntilMs, 0))
  };
}

function sanitizeStringList(value: unknown, allowed?: string[]): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string' || entry.length === 0) continue;
    if (allowed && !allowed.includes(entry)) continue;
    seen.add(entry);
  }
  return [...seen];
}

/**
 * Turns anything read from disk into a valid save. Unknown or corrupt fields
 * fall back to defaults instead of breaking the game.
 */
export function sanitizeSave(
  raw: unknown,
  now = Date.now(),
  knownIds?: { crops: string[]; fish: string[]; animals: string[]; memories?: string[] }
): SaveState {
  const safe = defaultSave(now);
  if (!isRecord(raw)) return safe;

  if (isLang(raw.lang)) safe.lang = raw.lang;
  if (isQuality(raw.quality)) safe.quality = raw.quality;
    safe.sound = sanitizeSound(raw.sound);

  const loadout = raw.loadout;
  if (isRecord(loadout)) {
    const bubu = loadout.bubu;
    if (isRecord(bubu)) {
      if (isBubuAccessory(bubu.accessory)) safe.loadout.bubu.accessory = bubu.accessory;
      if (isRibbon(bubu.ribbon)) safe.loadout.bubu.ribbon = bubu.ribbon;
    }
    const dudu = loadout.dudu;
    if (isRecord(dudu) && isDuduAccessory(dudu.accessory)) {
      safe.loadout.dudu.accessory = dudu.accessory;
    }
  }

  const progress = raw.progress;
  if (!isRecord(progress)) return safe;

  safe.progress.coins = Math.max(0, Math.round(toNumber(progress.coins, STARTING_COINS)));

  if (Array.isArray(progress.plots)) {
    const plots = progress.plots.slice(0, PLOT_COUNT).map((plot) => sanitizePlot(plot, now));
    while (plots.length < PLOT_COUNT) plots.push(emptyPlot(now));
    safe.progress.plots = plots;
  }

  if (isRecord(progress.inventory)) {
    const inventory: Record<string, number> = {};
    for (const [key, value] of Object.entries(progress.inventory)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      const count = Math.max(0, Math.floor(value));
      if (count > 0) inventory[key] = count;
    }
    safe.progress.inventory = inventory;
  }

  if (isRecord(progress.collection)) {
    const collection = progress.collection;
    safe.progress.collection = {
      fish: sanitizeStringList(collection.fish, knownIds?.fish),
      crops: sanitizeStringList(collection.crops, knownIds?.crops),
      animals: sanitizeStringList(collection.animals, knownIds?.animals)
    };
    if (safe.progress.collection.animals.length === 0) {
      safe.progress.collection.animals = ['cimoy', 'jamal', 'anak-ayam'];
    }
  }

  if (isRecord(progress.animalNames)) {
    const names: Record<string, string> = { ...DEFAULT_ANIMAL_NAMES };
    for (const [key, value] of Object.entries(progress.animalNames)) {
      if (typeof value !== 'string') continue;
      const trimmed = value.trim().slice(0, 14);
      if (trimmed.length > 0) names[key] = trimmed;
    }
    safe.progress.animalNames = names;
  }

  safe.progress.memories = sanitizeStringList(progress.memories, knownIds?.memories);
    safe.progress.finaleSeen = progress.finaleSeen === true;
    safe.progress.birthdaySeen = sanitizeStringList(progress.birthdaySeen);

    return safe;
  }

export function parseSave(
  text: string | null,
  now = Date.now(),
  knownIds?: { crops: string[]; fish: string[]; animals: string[]; memories?: string[] }
): SaveState {
  if (!text) return defaultSave(now);
  try {
    return sanitizeSave(JSON.parse(text), now, knownIds);
  } catch {
    return defaultSave(now);
  }
}

export function loadSave(
  storage?: StorageLike,
  options: {
    now?: number;
      knownIds?: { crops: string[]; fish: string[]; animals: string[]; memories?: string[] };
  } = {}
): SaveState {
  const target = storage ?? safeStorage();
  const now = options.now ?? Date.now();
  if (!target) return defaultSave(now);
  try {
    return parseSave(target.getItem(SAVE_KEY), now, options.knownIds);
  } catch {
    return defaultSave(now);
  }
}

export function writeSave(state: SaveState, storage?: StorageLike): boolean {
  const target = storage ?? safeStorage();
  if (!target) return false;
  try {
    target.setItem(SAVE_KEY, JSON.stringify(sanitizeSave(state)));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(storage?: StorageLike): void {
  const target = storage ?? safeStorage();
  if (!target) return;
  try {
    target.removeItem(SAVE_KEY);
  } catch {
    // Storage can be disabled in private mode; there is nothing else to do.
  }
}

export function addItem(inventory: Record<string, number>, id: string, amount = 1): void {
  const current = inventory[id] ?? 0;
  const next = current + amount;
  if (next <= 0) delete inventory[id];
  else inventory[id] = next;
}

function safeStorage(): StorageLike | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = `${SAVE_KEY}:probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}