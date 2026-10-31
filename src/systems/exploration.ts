import { SPOTS, STARTING_ZONES, ZONES, type SpotDef, type ZoneDef, type ZoneId } from '../data/zones';

export function isZoneUnlocked(
  zone: ZoneDef,
  visitedZones: string[],
  memoryCount: number
): boolean {
  if (visitedZones.includes(zone.id)) return true;
  if (zone.unlock === 'start') return true;
  if (zone.unlock === 'proximity') return false;
  return memoryCount >= zone.unlock.memories;
}

/** True for zones that become walk-in discoverable (not memory gated). */
export function isProximityZone(zone: ZoneDef): boolean {
  return zone.unlock === 'start' || zone.unlock === 'proximity';
}

export function distanceToZone(zone: ZoneDef, x: number, z: number): number {
  return Math.hypot(x - zone.center.x, z - zone.center.z);
}

/**
 * The zone whose circle contains the point. When circles overlap the closest
 * centre wins, which keeps borders predictable while walking.
 */
export function zoneAt(x: number, z: number): ZoneId | null {
  let best: { id: ZoneId; distance: number } | null = null;
  for (const zone of ZONES) {
    const distance = distanceToZone(zone, x, z);
    if (distance > zone.radius) continue;
    if (!best || distance < best.distance) best = { id: zone.id, distance };
  }
  return best?.id ?? null;
}

export function initialVisitedZones(): ZoneId[] {
  return [...STARTING_ZONES];
}

export function withVisited(visited: string[], zoneId: ZoneId): string[] {
  if (visited.includes(zoneId)) return visited;
  return [...visited, zoneId];
}

/** A zone is discovered the first time the player walks into an unlocked one. */
export function shouldDiscoverZone(
  x: number,
  z: number,
  visited: string[],
  memoryCount: number
): ZoneDef | null {
  const id = zoneAt(x, z);
  if (!id || visited.includes(id)) return null;
  const zone = ZONES.find((entry) => entry.id === id);
  if (!zone) return null;
  // Proximity zones open exactly by standing in them; memory gates are handled
  // separately so a locked cave can never be revealed by walking.
  if (!isProximityZone(zone)) return null;
  if (zone.unlock === 'start' && !isZoneUnlocked(zone, visited, memoryCount)) return null;
  return zone;
}

export function zoneUnlockedByMemories(visited: string[], memoryCount: number): ZoneDef | null {
  for (const zone of ZONES) {
    if (typeof zone.unlock !== 'object') continue;
    if (visited.includes(zone.id)) continue;
    if (memoryCount >= zone.unlock.memories) return zone;
  }
  return null;
}

export function spotInReach(
  x: number,
  z: number,
  discovered: string[],
  spots: SpotDef[] = SPOTS
): SpotDef | null {
  let best: { spot: SpotDef; distance: number } | null = null;
  for (const spot of spots) {
    if (discovered.includes(spot.id)) continue;
    const distance = Math.hypot(x - spot.position.x, z - spot.position.z);
    if (distance > spot.radius) continue;
    if (!best || distance < best.distance) best = { spot, distance };
  }
  return best?.spot ?? null;
}

export function isSpotDiscovered(spotId: string, discovered: string[]): boolean {
  return discovered.includes(spotId);
}

export function zoneProgress(visited: string[], discovered: string[]): {
  zones: number;
  totalZones: number;
  spots: number;
  totalSpots: number;
  percent: number;
} {
  const totalZones = ZONES.length;
  const totalSpots = SPOTS.length;
  const zones = ZONES.filter((zone) => visited.includes(zone.id)).length;
  const spots = SPOTS.filter((spot) => discovered.includes(spot.id)).length;
  const percent = Math.round(((zones + spots) / (totalZones + totalSpots)) * 100);
  return { zones, totalZones, spots, totalSpots, percent };
}

export function nextUndiscoveredZone(visited: string[], memoryCount: number): ZoneDef | null {
  return (
    ZONES.find(
      (zone) => !visited.includes(zone.id) && isProximityZone(zone)
    ) ??
    ZONES.find(
      (zone) =>
        !visited.includes(zone.id) &&
        typeof zone.unlock === 'object' &&
        memoryCount < zone.unlock.memories
    ) ??
    null
  );
}

export function fastTravelTarget(zone: ZoneDef): { x: number; z: number } {
  return { ...zone.arrival };
}