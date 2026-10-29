import { describe, expect, it } from 'vitest';
import { FishingRound, CAST_MAX_MS, CAST_MIN_MS } from '../src/systems/fishing';
import { FISH, fishById } from '../src/data/crops';

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

describe('fishing round', () => {
  it('waits for a bite instead of biting instantly', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    const state = round.start(FISH[0]);
    expect(state.phase).toBe('waiting');
    const wait = state.deadlineMs - clock.value;
    expect(wait).toBeGreaterThanOrEqual(CAST_MIN_MS);
    expect(wait).toBeLessThanOrEqual(CAST_MAX_MS);
  });

  it('shows a bite after the wait and closes it after the window', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    const fish = fishById('jamal')!;
    round.start(fish);
    clock.advance(CAST_MAX_MS + 1);
    expect(round.tick().phase).toBe('bite');
    clock.advance(fish.biteWindowMs + 1);
    const missed = round.tick();
    expect(missed.phase).toBe('missed');
    expect(missed.outcome).toBe('slipped');
  });

  it('tapping too early loses the fish', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    round.start(FISH[0]);
    const state = round.tap();
    expect(state.phase).toBe('missed');
    expect(state.outcome).toBe('early');
  });

  it('hooks the fish when tapping during the bite', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    round.start(FISH[0]);
    clock.advance(CAST_MAX_MS + 1);
    round.tick();
    const state = round.tap();
    expect(state.phase).toBe('reeling');
    expect(state.reelProgress).toBe(0);
  });

  it('lands the fish when the reel bar fills', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    const fish = fishById('koi-krem')!;
    round.start(fish);
    clock.advance(CAST_MAX_MS + 1);
    round.tick();
    round.tap();
    clock.advance(fish.reelMs / 2);
    round.holdTick(true);
    expect(round.getState().phase).toBe('reeling');
    clock.advance(fish.reelMs);
    const caught = round.holdTick(true);
    expect(caught.phase).toBe('caught');
    expect(caught.outcome).toBe('caught');
  });

  it('stalls while the player is not holding', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    round.start(FISH[0]);
    clock.advance(CAST_MAX_MS + 1);
    round.tick();
    round.tap();
    clock.advance(400);
    const stalled = round.holdTick(false);
    expect(stalled.reelProgress).toBe(0);
    expect(stalled.phase).toBe('reeling');
  });

  it('lets the fish slip away if reeling takes too long', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    const fish = FISH[0];
    round.start(fish);
    clock.advance(CAST_MAX_MS + 1);
    round.tick();
    round.tap();
    clock.advance(fish.reelMs * 2);
    const state = round.holdTick(false);
    expect(state.phase).toBe('missed');
  });

  it('picks rarer fish less often', () => {
    let rare = 0;
    let common = 0;
    for (let i = 0; i < 400; i += 1) {
      const round = new FishingRound({ random: fixedRandom((i % 100) / 100) });
      const fish = round.pick();
      if (fish.rarity === 'rare') rare += 1;
      if (fish.rarity === 'common') common += 1;
    }
    expect(common).toBeGreaterThan(rare);
  });

  it('resets back to idle', () => {
    const clock = new Clock();
    const round = new FishingRound({ now: clock.now, random: fixedRandom() });
    round.start();
    round.reset();
    expect(round.getState().phase).toBe('idle');
    expect(round.isActive()).toBe(false);
  });
});