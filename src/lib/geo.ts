import type { NormalizedRecord } from "./notion";

export const CATALONIA_BOUNDS = {
  west: 0.5,
  east: 3.5,
  south: 40.5,
  north: 43.0,
  center: [2.0, 41.7] as [number, number],
};

export function seededRandom(seed: string): number {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
  }
  return (h >>> 0) / 0x100000000;
}

export function getActorPosition(
  actorId: string,
  priorityId: "all" | string
): [lng: number, lat: number] {
  const lng =
    CATALONIA_BOUNDS.west +
    (CATALONIA_BOUNDS.east - CATALONIA_BOUNDS.west) *
      seededRandom(`${actorId}|${priorityId}|lng`);

  const lat =
    CATALONIA_BOUNDS.south +
    (CATALONIA_BOUNDS.north - CATALONIA_BOUNDS.south) *
      seededRandom(`${actorId}|${priorityId}|lat`);

  return [lng, lat];
}

export function buildActorPositions(
  records: NormalizedRecord[],
  priorityIds: string[]
): Record<string, Record<string, [number, number]>> {
  const ids = ["all", ...priorityIds];
  const out: Record<string, Record<string, [number, number]>> = {};

  for (const record of records) {
    const map: Record<string, [number, number]> = {};
    for (const priorityId of ids) {
      map[priorityId] = getActorPosition(record.id, priorityId);
    }
    out[record.id] = map;
  }

  return out;
}
