import { FISH, fishById, type FishDef } from '../data/crops';

export type FishingPhase = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught' | 'missed';

export interface FishingState {
  phase: FishingPhase;
  fish: FishDef | null;
  /** When the float will dip (waiting) or when the bite window closes (bite). */
  deadlineMs: number;
  reelProgress: number;
  lastTickMs: number;
  /** Set when the round ends, so the UI can show the right message. */
  outcome: 'early' | 'slipped' | 'caught' | null;
}

export const CAST_MIN_MS = 1800;
export const CAST_MAX_MS = 3600;
export const REEL_GRACE = 1.35;

export function idleState(): FishingState {
  return {
    phase: 'idle',
    fish: null,
    deadlineMs: 0,
    reelProgress: 0,
    lastTickMs: 0,
    outcome: null
  };
}

export interface FishingOptions {
  random?: () => number;
  now?: () => number;
}

export class FishingRound {
  private state: FishingState = idleState();
  private readonly random: () => number;
  private readonly now: () => number;

  constructor(options: FishingOptions = {}) {
    this.random = options.random ?? Math.random;
    this.now = options.now ?? (() => Date.now());
  }

  getState(): FishingState {
    return this.state;
  }

  pick(): FishDef {
    const weights = FISH.map((fish) =>
      fish.rarity === 'common' ? 5 : fish.rarity === 'uncommon' ? 2.4 : 1
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = this.random() * total;
    for (let i = 0; i < FISH.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return FISH[i];
    }
    return FISH[0];
  }

  start(fish?: FishDef): FishingState {
    const now = this.now();
    const chosen = fish ?? this.pick();
    const wait = CAST_MIN_MS + this.random() * (CAST_MAX_MS - CAST_MIN_MS);
    this.state = {
      phase: 'waiting',
      fish: chosen,
      deadlineMs: now + wait,
      reelProgress: 0,
      lastTickMs: now,
      outcome: null
    };
    return this.state;
  }

  tick(): FishingState {
      const now = this.now();
      if (this.state.phase === 'waiting' && now >= this.state.deadlineMs) {
        this.state = {
          ...this.state,
          phase: 'bite',
          deadlineMs: now + (this.state.fish?.biteWindowMs ?? 1000),
          lastTickMs: now
        };
      } else if (this.state.phase === 'bite' && now > this.state.deadlineMs) {
        this.state = { ...this.state, phase: 'missed', outcome: 'slipped' };
      } else if (this.state.phase === 'reeling' && now > this.state.deadlineMs) {
        this.state = { ...this.state, phase: 'missed', outcome: 'slipped' };
      }
      return this.state;
    }

    /** A tap on the water: too early when waiting, hooks the fish during a bite. */
    tap(): FishingState {
      const now = this.now();
      this.tick();
      const fish = this.state.fish;
      if (this.state.phase === 'waiting') {
        this.state = { ...this.state, phase: 'missed', outcome: 'early' };
      } else if (this.state.phase === 'bite' && fish) {
        this.state = {
          ...this.state,
          phase: 'reeling',
          reelProgress: 0,
          lastTickMs: now,
          deadlineMs: now + fish.reelMs * REEL_GRACE
        };
      }
      return this.state;
    }

    holdTick(held: boolean): FishingState {
      const now = this.now();
          const fish = this.state.fish;
          if (this.state.phase !== 'reeling' || !fish) return this.tick();

          const dt = Math.max(0, now - this.state.lastTickMs);
          this.state = { ...this.state, lastTickMs: now };
          if (!held) return this.tick();

          const reelMs = fish.reelMs;
      const next = Math.min(1, this.state.reelProgress + dt / reelMs);
      this.state = { ...this.state, reelProgress: next };
      if (next >= 1) {
        this.state = { ...this.state, phase: 'caught', outcome: 'caught' };
      }
      return this.tick();
    }

  reset(): FishingState {
    this.state = idleState();
    return this.state;
  }

  isActive(): boolean {
    return this.state.phase !== 'idle' && this.state.phase !== 'caught' && this.state.phase !== 'missed';
  }
}

export function fishLabel(id: string): string {
  return fishById(id)?.name.id ?? id;
}