import { describe, expect, it } from 'vitest';
import {
  BAND_CENTER,
  FishingRound,
  SWEET_MAX,
  SWEET_MIN,
  defaultSpotResolver,
  idleState
} from '../src/systems/fishing';
import { fishById } from '../src/data/fish';

class Clock {
  value = 1_000_000;
  now = () => this.value;
  advance(ms: number): void {
    this.value += ms;
  }
}

function fixedRandom(value = 0.5): () => number {
  return () => value;
}

describe('casting power meter', () => {
  it('charges from idle on press and casts on release', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    round.press();
    expect(round.getState().phase).toBe('charging');
    clock.advance(40);
    round.tick();
    expect(round.getState().power).toBeGreaterThan(0);
    round.release();
    const state = round.getState();
    expect(state.phase).toBe('waiting');
    expect(state.power).toBeGreaterThan(0);
  });

  it('maps power to a water spot', () => {
    expect(defaultSpotResolver(0.3)).toBe('tepi');
    expect(defaultSpotResolver(0.6)).toBe('tengah');
    expect(defaultSpotResolver(0.9)).toBe('teratai');
  });

  it('rewards a sweet-spot cast with higher cast quality', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    round.press();
    const sweetPower = (SWEET_MIN + SWEET_MAX) / 2;
    // Drive power manually into the sweet spot by releasing at the right step.
        for (let i = 0; i < 100 && round.getState().power < sweetPower; i += 1) {
          clock.advance(16);
          round.tick();
        }
        round.release();
        expect(round.getState().castQuality).toBe(0.9);
  });
});

describe('bite and catch', () => {
  it('turns a waiting cast into a bite after the wait', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom(0.9) });
    round.press();
    clock.advance(40);
    round.tick();
    round.release();
    const state = round.getState();
    clock.advance(state.biteAt - clock.value + 1);
    round.tick();
    const after = round.getState();
    expect(after.phase === 'bite' || after.phase === 'reeling').toBe(true);
  });

  it('tapping too early loses the fish once the float is still waiting', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom(0.9) });
    round.press();
    clock.advance(40);
    round.tick();
    round.release();
    round.tap();
    expect(round.getState().outcome).toBe('early');
  });
});

describe('reeling tension', () => {
  it('lands a fish when the line stays inside the band and the reel fills', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom(0.5) });
    round.setContext({ memories: [], totalCatches: 0 });
    // Force a bite immediately.
    round.press();
    clock.advance(40);
    round.tick();
    round.release();
    const wait = round.getState().biteAt - clock.value;
    clock.advance(wait + 1);
    round.tick();
    round.tap();

    const fish = round.getState().fish;
    // Keep holding; the band is generous enough for fixedRandom to land it.
    let guard = 0;
    while (round.getState().phase === 'reeling' && guard < 500) {
      clock.advance(16);
      round.holdTick(true);
      guard += 1;
    }
    expect(round.getState().phase).toBe('caught');
    expect(round.getState().catchId).toBe(fish?.id ?? null);
    expect(round.getState().catchSize).not.toBeNull();
  });

  it('pulling with no hold still advances slowly, never instantly', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom(0.5) });
    round.setContext({ memories: [], totalCatches: 0 });
    round.press();
    clock.advance(40);
    round.tick();
    round.release();
    const wait = round.getState().biteAt - clock.value;
    clock.advance(wait + 1);
    round.tick();
    round.tap();
    const before = round.getState().reelProgress;
    clock.advance(200);
    round.holdTick(false);
    expect(round.getState().reelProgress).toBeLessThan(1);
    expect(round.getState().reelProgress).toBeLessThan(before + 0.3);
  });
});

describe('resolve catch pool', () => {
  it('never returns a memory-gated secret before its memory opens', () => {
      for (let i = 0; i < 60; i += 1) {
        const clock = new Clock();
        const round = new FishingRound({ now: clock.now, random: fixedRandom((i % 10) / 10) });
        round.setContext({ memories: [], totalCatches: 0 });
        round.setSpot('teratai');
        round.setBait('bait-bunga');
        round.press();
        clock.advance(30);
        round.tick();
        round.release();
        const wait = round.getState().biteAt - clock.value;
        clock.advance(wait + 1);
        round.tick();
        round.tap();
        const fish = round.getState().fish ?? null;
        if (fish) expect(fish.id).not.toBe('cupang-jamal-legend');
      }
    });

  it('exposes heart koi only to the heart bait', () => {
      const fish = fishById('koi-hati')!;
      expect(fish.needs?.bait).toBe('bait-hati');
      expect(fish.tier).toBe('rare');
      const round = new FishingRound({ random: fixedRandom(0) });
      round.setContext({ memories: [], totalCatches: 0 });
      round.setSpot('teratai');
      round.setBait('bait-cacing');
      // A non-heart bait never fishes heart koi out of the pool in a full loop.
      for (let i = 0; i < 20; i += 1) {
        const clock = new Clock();
        round.setBait('bait-cacing');
        round.press();
        clock.advance(30);
        round.tick();
        round.release();
        const wait = round.getState().biteAt - clock.value;
        clock.advance(wait + 1);
        round.tick();
        round.tap();
        const f = round.getState().fish;
        if (f) expect(f.id).not.toBe('koi-hati');
        round.reset();
      }
    });
});

describe('idle state', () => {
  it('starts and resets cleanly', () => {
    const state = idleState();
    expect(state.phase).toBe('idle');
    expect(state.power).toBe(0);
    expect(state.tension).toBe(BAND_CENTER);
    expect(state.outcome).toBeNull();
  });
});