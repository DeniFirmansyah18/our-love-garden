import { describe, expect, it } from 'vitest';
import {
  advanceAll,
  advancePlot,
  growMsFor,
  harvest,
  isReady,
  needsWater,
  plant,
  progressOf,
  secondsLeft,
  stageOf,
  waterPlot
} from '../src/systems/farming';
import { cropById } from '../src/data/crops';
import { emptyPlot } from '../src/save/save';

const T0 = 1_700_000_000_000;
const rose = cropById('mawar')!;

describe('planting', () => {
  it('plants into empty soil and refuses occupied soil', () => {
    const empty = emptyPlot(T0);
    const planted = plant(empty, 'mawar', T0);
    expect(planted.cropId).toBe('mawar');
    expect(planted.growthMs).toBe(0);

    const again = plant(planted, 'wortel', T0 + 10);
    expect(again.cropId).toBe('mawar');
  });

  it('ignores unknown crop ids', () => {
    const planted = plant(emptyPlot(T0), 'durian', T0);
    expect(planted.cropId).toBeNull();
  });
});

describe('growth', () => {
  it('reaches ready after the full watered grow time', () => {
    let plot = plant(emptyPlot(T0), 'mawar', T0);
    plot = waterPlot(plot, T0);
    plot = advancePlot(plot, T0 + growMsFor(rose));
    expect(isReady(plot)).toBe(true);
    expect(progressOf(plot)).toBe(1);
    expect(stageOf(plot)).toBe(rose.stages);
  });

  it('caps growth at the crop maximum', () => {
    let plot = plant(emptyPlot(T0), 'mawar', T0);
    plot = waterPlot(plot, T0);
    plot = advancePlot(plot, T0 + growMsFor(rose) * 5);
    expect(plot.growthMs).toBe(growMsFor(rose));
  });

  it('grows slower while dry', () => {
    const half = growMsFor(rose) / 2;
    const wet = advancePlot(waterPlot(plant(emptyPlot(T0), 'mawar', T0), T0), T0 + half);
    const dry = advancePlot(plant(emptyPlot(T0), 'mawar', T0), T0 + half);
    expect(progressOf(wet)).toBeCloseTo(0.5, 2);
    expect(progressOf(dry)).toBeLessThan(0.25);
    expect(needsWater(dry, T0 + half)).toBe(true);
  });

  it('drinks its water after the duration', () => {
    let plot = plant(emptyPlot(T0), 'mawar', T0);
    plot = waterPlot(plot, T0);
    expect(needsWater(plot, T0 + 1000)).toBe(false);
    expect(needsWater(plot, T0 + 200_000)).toBe(true);
  });

  it('does not grow while the clock goes backwards', () => {
    const plot = advancePlot(plant(emptyPlot(T0), 'mawar', T0), T0 - 5000);
    expect(plot.growthMs).toBe(0);
  });

  it('clears a crop whose id no longer exists', () => {
    const stale = { cropId: 'legacy-turnip', growthMs: 100, lastTickMs: T0, wateredUntilMs: 0 };
    const advanced = advancePlot(stale, T0 + 1000);
    expect(advanced.cropId).toBeNull();
    expect(advanced.growthMs).toBe(0);
  });

  it('reports remaining seconds and speeds up when watered', () => {
    const start = plant(emptyPlot(T0), 'mawar', T0);
    const dryLeft = secondsLeft(start, T0);
    const wetLeft = secondsLeft(waterPlot(start, T0), T0);
    expect(dryLeft).toBeGreaterThan(wetLeft);
    expect(wetLeft).toBe(rose.growSeconds);
  });

  it('advances every plot once', () => {
    const plots = [plant(emptyPlot(T0), 'mawar', T0), emptyPlot(T0), plant(emptyPlot(T0), 'wortel', T0)];
    const advanced = advanceAll(plots, T0 + 1000);
    expect(advanced).toHaveLength(3);
    expect(advanced[1].cropId).toBeNull();
    expect(advanced[0].lastTickMs).toBe(T0 + 1000);
  });
});

describe('harvesting', () => {
  it('refuses to harvest before it is ready', () => {
    const plot = plant(emptyPlot(T0), 'mawar', T0);
    const result = harvest(plot, T0 + 1000);
    expect(result.ready).toBe(false);
    expect(result.cropId).toBeNull();
    expect(result.plot.cropId).toBe('mawar');
  });

  it('returns the crop and clears the plot when ready', () => {
    let plot = plant(emptyPlot(T0), 'mawar', T0);
    plot = waterPlot(plot, T0);
    plot = advancePlot(plot, T0 + growMsFor(rose));
    const result = harvest(plot, T0 + growMsFor(rose));
    expect(result.ready).toBe(true);
    expect(result.cropId).toBe('mawar');
    expect(result.plot.cropId).toBeNull();
    expect(result.plot.growthMs).toBe(0);
  });

  it('does nothing on bare soil', () => {
    const result = harvest(emptyPlot(T0), T0);
    expect(result.ready).toBe(false);
    expect(result.cropId).toBeNull();
  });
});