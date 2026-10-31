import { describe, expect, it } from 'vitest';
import {
  distanceToZone,
  fastTravelTarget,
  initialVisitedZones,
  isSpotDiscovered,
  isZoneUnlocked,
  nextUndiscoveredZone,
  shouldDiscoverZone,
  spotInReach,
  withVisited,
  zoneAt,
  zoneProgress,
  zoneUnlockedByMemories
} from '../src/systems/exploration';
import { SPOTS, STARTING_ZONES, ZONES, spotById, zoneById } from '../src/data/zones';

describe('zones', () => {
  it('defines seven districts, each discoverable', () => {
    expect(ZONES).toHaveLength(7);
    expect(new Set(ZONES.map((zone) => zone.id)).size).toBe(7);
    for (const zone of ZONES) {
      expect(zone.radius).toBeGreaterThan(4);
      expect(zone.arrival).not.toEqual(zone.center);
      expect(zone.name.id.length).toBeGreaterThan(3);
      expect(zone.blurb.en.length).toBeGreaterThan(10);
    }
  });

  it('starts with garden and home open', () => {
    expect(initialVisitedZones()).toEqual(STARTING_ZONES);
    expect(isZoneUnlocked(zoneById('garden')!, [], 0)).toBe(true);
    expect(isZoneUnlocked(zoneById('home')!, [], 0)).toBe(true);
    expect(isZoneUnlocked(zoneById('lake')!, [], 0)).toBe(false);
  });

  it('opens the cave only after three memories', () => {
    const cave = zoneById('cave')!;
    expect(isZoneUnlocked(cave, [], 2)).toBe(false);
    expect(isZoneUnlocked(cave, [], 3)).toBe(true);
    expect(zoneUnlockedByMemories([], 2)).toBeNull();
    expect(zoneUnlockedByMemories([], 3)?.id).toBe('cave');
    expect(zoneUnlockedByMemories(['cave'], 5)).toBeNull();
  });

  it('reports the zone a point belongs to', () => {
    expect(zoneAt(9, 2)).toBe('garden');
    expect(zoneAt(0, -16)).toBe('lake');
    expect(zoneAt(25, 2)).toBe('beach');
    expect(zoneAt(0, 0)).toBeNull();
  });

  it('picks the nearest centre when circles overlap', () => {
    const lake = zoneById('lake')!;
    const cave = zoneById('cave')!;
    const midpoint = { x: (lake.center.x + cave.center.x) / 2, z: (lake.center.z + cave.center.z) / 2 };
    const id = zoneAt(midpoint.x, midpoint.z);
    if (id) {
      const winner = zoneById(id)!;
      const other = winner.id === 'lake' ? cave : lake;
      expect(distanceToZone(winner, midpoint.x, midpoint.z)).toBeLessThanOrEqual(
        distanceToZone(other, midpoint.x, midpoint.z)
      );
    }
  });

  it('discovers proximity zones once, and never memory-gated ones by walking', () => {
    const lake = shouldDiscoverZone(0, -16, ['garden', 'home'], 0);
    expect(lake?.id).toBe('lake');
    expect(shouldDiscoverZone(0, -16, ['garden', 'home', 'lake'], 0)).toBeNull();
    expect(shouldDiscoverZone(-21, -13, ['garden', 'home'], 5)).toBeNull();
    expect(shouldDiscoverZone(0, 0, ['garden'], 5)).toBeNull();
  });

  it('adds zones without duplicating', () => {
    const once = withVisited(['garden'], 'lake');
    expect(once).toEqual(['garden', 'lake']);
    expect(withVisited(once, 'lake')).toBe(once);
  });

  it('suggests the next zone to explore', () => {
    expect(nextUndiscoveredZone(['garden', 'home'], 0)?.id).toBe('lake');
    expect(nextUndiscoveredZone(ZONES.map((zone) => zone.id), 0)).toBeNull();
  });

  it('offers a fast travel arrival inside the zone', () => {
    for (const zone of ZONES) {
      const target = fastTravelTarget(zone);
      expect(distanceToZone(zone, target.x, target.z)).toBeLessThan(zone.radius);
    }
  });
});

describe('spots', () => {
  it('defines ten hidden spots inside their zones', () => {
    expect(SPOTS).toHaveLength(10);
    for (const spot of SPOTS) {
      const zone = zoneById(spot.zone)!;
      expect(distanceToZone(zone, spot.position.x, spot.position.z)).toBeLessThan(zone.radius);
      expect(spot.radius).toBeGreaterThan(1.5);
      expect(spot.reward?.coins ?? 0).toBeGreaterThan(0);
    }
  });

  it('finds the closest undiscovered spot in reach', () => {
    const spot = spotById('garden-lamp')!;
    expect(spotInReach(spot.position.x, spot.position.z, [])?.id).toBe('garden-lamp');
    expect(spotInReach(spot.position.x, spot.position.z, ['garden-lamp'])).toBeNull();
    expect(spotInReach(0, 0, [])).toBeNull();
  });

  it('never reports a spot twice', () => {
    const bench = spotById('bench-romantic')!;
    expect(isSpotDiscovered('bench-romantic', [])).toBe(false);
    const found = spotInReach(bench.position.x, bench.position.z, ['bench-romantic']);
    expect(found).toBeNull();
  });

  it('measures exploration progress', () => {
    const progress = zoneProgress(['garden', 'home'], ['garden-lamp']);
    expect(progress.zones).toBe(2);
    expect(progress.totalZones).toBe(7);
    expect(progress.spots).toBe(1);
    expect(progress.totalSpots).toBe(10);
    expect(progress.percent).toBe(Math.round((3 / 17) * 100));
  });
});