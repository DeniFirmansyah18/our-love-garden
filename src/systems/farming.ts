import { CROPS, cropById, type CropDef } from '../data/crops';
import type { PlotState } from '../save/save';

/** Water lasts this long in real time. */
export const WATER_DURATION_MS = 75_000;
/** Dry soil still grows, just slowly enough that watering feels worth it. */
export const DRY_GROWTH_RATE = 0.35;

export function growMsFor(crop: CropDef): number {
  return crop.growSeconds * 1000;
}

export function isWatered(plot: PlotState, now: number): boolean {
  return plot.wateredUntilMs > now;
}

export function waterPlot(plot: PlotState, now: number): PlotState {
  if (!plot.cropId) return plot;
  const base = Math.max(now, plot.wateredUntilMs);
  return { ...plot, wateredUntilMs: base + WATER_DURATION_MS, lastTickMs: plot.lastTickMs };
}

/**
 * Advances one plot to `now`. Pure: returns a new plot, leaves the input alone,
 * so the growth curve can be unit tested without a renderer.
 */
export function advancePlot(plot: PlotState, now: number): PlotState {
  if (!plot.cropId) {
    return plot.lastTickMs === now ? plot : { ...plot, lastTickMs: now };
  }
  const crop = cropById(plot.cropId);
  if (!crop) return { ...plot, cropId: null, growthMs: 0, lastTickMs: now, wateredUntilMs: 0 };

  const elapsed = Math.max(0, now - plot.lastTickMs);
  if (elapsed === 0) return plot;

  const rate = plot.wateredUntilMs > now ? 1 : DRY_GROWTH_RATE;
  const total = growMsFor(crop);
  const growthMs = Math.min(total, plot.growthMs + elapsed * rate);
  return { ...plot, growthMs, lastTickMs: now };
}

export function plant(plot: PlotState, cropId: string, now: number): PlotState {
  if (plot.cropId) return plot;
  if (!cropById(cropId)) return plot;
  return { cropId, growthMs: 0, lastTickMs: now, wateredUntilMs: 0 };
}

export function harvest(plot: PlotState, now: number): { plot: PlotState; cropId: string | null; ready: boolean } {
  const crop = cropById(plot.cropId);
  if (!crop) {
    return { plot: { ...plot, lastTickMs: now }, cropId: null, ready: false };
  }
  const ready = plot.growthMs >= growMsFor(crop);
  if (!ready) return { plot, cropId: null, ready: false };
  return {
    plot: { cropId: null, growthMs: 0, lastTickMs: now, wateredUntilMs: 0 },
    cropId: crop.id,
    ready: true
  };
}

export function progressOf(plot: PlotState): number {
  const crop = cropById(plot.cropId);
  if (!crop) return 0;
  return Math.min(1, plot.growthMs / growMsFor(crop));
}

export function stageOf(plot: PlotState): number {
  const crop = cropById(plot.cropId);
  if (!crop) return 0;
  const progress = progressOf(plot);
  if (progress >= 1) return crop.stages;
  return Math.max(1, Math.min(crop.stages - 1, Math.ceil(progress * crop.stages)));
}

export function isReady(plot: PlotState): boolean {
  const crop = cropById(plot.cropId);
  if (!crop) return false;
  return plot.growthMs >= growMsFor(crop);
}

export function needsWater(plot: PlotState, now: number): boolean {
  if (!plot.cropId) return false;
  if (isReady(plot)) return false;
  return !isWatered(plot, now);
}

export function secondsLeft(plot: PlotState, now: number): number {
  const crop = cropById(plot.cropId);
  if (!crop) return 0;
  if (isReady(plot)) return 0;
  const rate = plot.wateredUntilMs > now ? 1 : DRY_GROWTH_RATE;
  const remaining = growMsFor(crop) - plot.growthMs;
  return Math.ceil(remaining / rate / 1000);
}

export function advanceAll(plots: PlotState[], now: number): PlotState[] {
  return plots.map((plot) => advancePlot(plot, now));
}

export const CROP_IDS = CROPS.map((crop) => crop.id);