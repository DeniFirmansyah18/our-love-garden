export interface SoundSettings {
  volume: number;
  music: boolean;
  sfx: boolean;
}

export const DEFAULT_SOUND: SoundSettings = { volume: 0.6, music: true, sfx: true };

export function clampVolume(value: unknown, fallback = DEFAULT_SOUND.volume): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

export function sanitizeSound(raw: unknown): SoundSettings {
  if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_SOUND };
  const record = raw as Record<string, unknown>;
  return {
    volume: clampVolume(record.volume),
    music: typeof record.music === 'boolean' ? record.music : DEFAULT_SOUND.music,
    sfx: typeof record.sfx === 'boolean' ? record.sfx : DEFAULT_SOUND.sfx
  };
}