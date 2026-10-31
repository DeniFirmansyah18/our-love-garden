import {
  BAIT_WORM,
  baitById,
  junkById,
  type BaitId,
  type DayTime,
  type FishDef,
  type WaterSpot
} from '../data/fish';
import {
  BAND_CENTER,
  defaultSpotResolver,
  resolveCatch,
  rollFishSize
} from './fishing-pool';

export { BAND_CENTER, defaultSpotResolver, rollFishSize };

export const CAST_MIN = 0.3;
export const CAST_MAX = 1;
export const SWEET_MIN = 0.72;
export const SWEET_MAX = 0.9;
export const BITE_MIN_MS = 1400;
export const BITE_MAX_MS = 5200;
export const BAND_HALF = 0.16;
export const JUNK_REEL_MS = 1600;
const REEL_PULL_RATE = 5;

export type FishingPhase =
  | 'idle'
  | 'charging'
  | 'waiting'
  | 'bite'
  | 'reeling'
  | 'caught'
  | 'missed';

export interface FishingState {
  phase: FishingPhase;
  fish: FishDef | null;
  catchId: string | null;
  catchSize: number | null;
  isJunk: boolean;
  bait: BaitId;
  spot: WaterSpot;
  power: number;
  castQuality: number;
  biteAt: number;
  deadline: number;
  reelProgress: number;
  tension: number;
  tensionDir: number;
  lastTick: number;
  outcome: 'early' | 'slipped' | 'caught' | null;
}

export function idleState(bait: BaitId = BAIT_WORM, spot: WaterSpot = 'tepi'): FishingState {
  return {
    phase: 'idle',
    fish: null,
    catchId: null,
    catchSize: null,
    isJunk: false,
    bait,
    spot,
    power: 0,
    castQuality: 0.5,
    biteAt: 0,
    deadline: 0,
    reelProgress: 0,
    tension: BAND_CENTER,
    tensionDir: 1,
    lastTick: 0,
    outcome: null
  };
}

export interface FishingOptions {
  now?: () => number;
  random?: () => number;
  spotResolver?: (power: number) => WaterSpot;
}

export class FishingRound {
  private state: FishingState;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly spotResolver: (power: number) => WaterSpot;
  private timeOfDay: DayTime = 'day';
  private memories: string[] = [];
  private totalCatches = 0;
  private assist = false;

  constructor(options: FishingOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.random = options.random ?? Math.random;
    this.spotResolver = options.spotResolver ?? defaultSpotResolver;
    this.state = idleState();
  }

  setContext(context: { memories: string[]; totalCatches: number }): void {
    this.memories = context.memories;
    this.totalCatches = context.totalCatches;
  }

  setTimeOfDay(time: DayTime): void {
    this.timeOfDay = time;
  }

  setAssist(assist: boolean): void {
    this.assist = assist;
  }

  getState(): FishingState {
    return this.state;
  }

  setBait(bait: BaitId): void {
    if (this.state.phase === 'idle') this.state = { ...this.state, bait };
  }

  setSpot(spot: WaterSpot): void {
    if (this.state.phase === 'idle') this.state = { ...this.state, spot };
  }

  /** Press: start charging the cast power meter. */
  press(): void {
    if (this.state.phase === 'idle') {
      this.state = { ...this.state, phase: 'charging', power: 0 };
    }
  }

  /** Release: cast the line at the current power. */
  release(): void {
    if (this.state.phase !== 'charging') return;
    const power = this.state.power;
    const spot = this.spotResolver(power);
    const sweet = power >= SWEET_MIN && power <= SWEET_MAX;
    const wait = BITE_MIN_MS + this.random() * (BITE_MAX_MS - BITE_MIN_MS);
    this.state = {
      ...this.state,
      phase: 'waiting',
      spot,
      castQuality: sweet ? 0.9 : 0.35 + power * 0.3,
      biteAt: this.now() + Math.round(wait * (sweet ? 0.72 : 1)),
      deadline: 0,
      reelProgress: 0,
      tension: BAND_CENTER,
      outcome: null
    };
  }

  tick(): void {
    const now = this.now();
    if (this.state.phase === 'charging') {
      this.state = { ...this.state, power: Math.min(1, this.state.power + 0.014) };
      return;
    }
    if (this.state.phase === 'waiting' && now >= this.state.biteAt) {
      const catchResult = resolveCatch(
        this.state.bait,
        this.timeOfDay,
        this.state.spot,
        this.state.castQuality,
        this.random,
        { memories: this.memories, totalCatches: this.totalCatches }
      );
      if (catchResult.isJunk || !catchResult.fish) {
        this.state = {
          ...this.state,
          phase: 'reeling',
          fish: null,
          catchId: catchResult.id,
          catchSize: null,
          isJunk: catchResult.isJunk,
          reelProgress: 0,
          tension: BAND_CENTER,
          deadline: this.now() + 9000,
          lastTick: now
        };
      } else {
        this.state = {
          ...this.state,
          phase: 'bite',
          fish: catchResult.fish,
          deadline: now + 1000,
          lastTick: now
        };
      }
    } else if (this.state.phase === 'bite' && now > this.state.deadline) {
      this.state = { ...this.state, phase: 'missed', outcome: 'slipped' };
        }
        // Reeling is driven by holdTick, not tick, so the two do not double-consume dt.
      }

      /** A tap during the bite hooks the fish; too early loses it. */
      tap(): void {
        this.tick();
        if (this.state.phase === 'waiting') {
          this.state = { ...this.state, phase: 'missed', outcome: 'early' };
        } else if (this.state.phase === 'bite') {
          this.state = {
            ...this.state,
            phase: 'reeling',
            reelProgress: 0,
            tension: BAND_CENTER,
            deadline: this.now() + 9000,
            lastTick: this.now()
          };
        }
      }

      /** Called per frame while reeling; `held` is whether the button is pressed. */
      holdTick(held: boolean): void {
        if (this.state.phase !== 'reeling') {
          this.tick();
          return;
        }
        this.updateReel(this.now(), held);
        if (this.now() > this.state.deadline) {
          this.state = { ...this.state, phase: 'missed', outcome: 'slipped' };
        }
  }

  private updateReel(now: number, held: boolean): void {
    if (this.state.phase !== 'reeling') return;
    const dt = Math.max(0, now - this.state.lastTick);
    this.state = { ...this.state, lastTick: now };

    if (!this.state.fish) {
      // Junk: a simple hold lands it.
      const progress = Math.min(1, this.state.reelProgress + dt / JUNK_REEL_MS);
      this.state = { ...this.state, reelProgress: progress };
      if (progress >= 1) {
        this.state = { ...this.state, phase: 'caught', outcome: 'caught', catchSize: null };
      }
      return;
    }

    const fish = this.state.fish;
    const bandHalf = this.assist ? BAND_HALF * 1.5 : BAND_HALF;
    const strength = fish.pull * (this.assist ? 0.72 : 1);

    let tension = this.state.tension;
        const seconds = dt / 1000;
        tension += strength * seconds * this.state.tensionDir;

        let tensionDir = this.state.tensionDir;
        const inBand = Math.abs(tension - BAND_CENTER) < bandHalf;
        if (inBand) {
          // Pull the marker toward the band center to keep it catchable.
          tension += (BAND_CENTER - tension) * Math.min(1, seconds * 4);
        }
        if (held) {
          const towardCenter = BAND_CENTER - tension;
          tension += towardCenter * Math.min(1, seconds * REEL_PULL_RATE);
        }

        if (tension >= 1) {
          tension = 1;
          tensionDir = -1;
        } else if (tension <= 0) {
          tension = 0;
          tensionDir = 1;
        }

        const onBand = Math.abs(tension - BAND_CENTER) < bandHalf;
        const gain = held && onBand ? 1 : 0.1;
        let progress = Math.min(1, this.state.reelProgress + (dt / fish.reelMs) * gain);
        if (held && !onBand) {
          progress = Math.max(0, this.state.reelProgress - 0.02 * (dt / 100));
        } else if (!held) {
          progress = Math.max(0, this.state.reelProgress - 0.01 * (dt / 1000));
        }

    this.state = { ...this.state, tension, tensionDir, reelProgress: progress };

    if (progress >= 1 && held) {
      this.state = {
        ...this.state,
        phase: 'caught',
        outcome: 'caught',
        catchId: fish.id,
        catchSize: rollFishSize(fish, this.random)
      };
    }
  }

  /** Peek at which fish bit, without advancing the state (for audio cues later). */
  currentFishId(): string | null {
    return this.state.fish?.id ?? null;
  }

  reset(): void {
    this.state = idleState(this.state.bait, this.state.spot);
  }

  isActive(): boolean {
    return this.state.phase !== 'idle' && this.state.phase !== 'caught' && this.state.phase !== 'missed';
  }
}

export function baitName(id: string): string {
  return baitById(id)?.name.id ?? id;
}

export function junkName(id: string): string {
  return junkById(id)?.name.id ?? id;
}