import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { NormalizedRecord } from "./notion";

export const CATALONIA_BOUNDS = {
  west: 0.5,
  east: 3.5,
  south: 40.5,
  north: 43.0,
  center: [2.0, 41.7] as [number, number],
};

export interface CataloniaBoundary {
  /** Closed rings of [lng, lat] coordinates. All rings are exterior boundaries of comarcas. */
  rings: Array<Array<[number, number]>>;
}

export function seededRandom(seed: string): number {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
  }
  return (h >>> 0) / 0x100000000;
}

function pointInRing(point: [number, number], ring: Array<[number, number]>): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInCatalonia(
  point: [number, number],
  boundary: CataloniaBoundary
): boolean {
  for (const ring of boundary.rings) {
    if (pointInRing(point, ring)) return true;
  }
  return false;
}

export function loadCataloniaBoundary(): CataloniaBoundary {
  // Resolve the GeoJSON relative to this source file so it works regardless of
  // the process cwd (local dev, astro build, direct node imports, etc.).
  const thisFile = fileURLToPath(import.meta.url);
  const geoPath = path.resolve(
    thisFile,
    "..",
    "..",
    "..",
    "..",
    "..",
    "packages",
    "maps",
    "catalunya-actor-map",
    "v0",
    "catalunya-comarques.geojson"
  );
  const raw = fs.readFileSync(geoPath, "utf8");
  const geojson = JSON.parse(raw);

  const rings: Array<Array<[number, number]>> = [];

  for (const feature of geojson.features ?? []) {
    const geom = feature.geometry;
    if (!geom) continue;

    const addRing = (ring: Array<[number, number]>) => {
      // Close the ring if needed (MapLibre / GeoJSON rings are usually closed, but be safe)
      const closed =
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]
          ? ring
          : [...ring, ring[0]];
      rings.push(closed);
    };

    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates ?? []) {
        addRing(ring as Array<[number, number]>);
      }
    } else if (geom.type === "MultiPolygon") {
      for (const polygon of geom.coordinates ?? []) {
        for (const ring of polygon ?? []) {
          addRing(ring as Array<[number, number]>);
        }
      }
    }
  }

  return { rings };
}

export function getActorPosition(
  actorId: string,
  priorityId: "all" | string,
  boundary: CataloniaBoundary
): [lng: number, lat: number] {
  // Attempt a deterministic sequence of points within the bounding box until
  // one falls inside the Catalunya territory. This keeps positions stable for
  // a given seed while ensuring no actor ends up in the sea, Aragon, or France.
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const lng =
      CATALONIA_BOUNDS.west +
      (CATALONIA_BOUNDS.east - CATALONIA_BOUNDS.west) *
        seededRandom(`${actorId}|${priorityId}|lng|${attempt}`);

    const lat =
      CATALONIA_BOUNDS.south +
      (CATALONIA_BOUNDS.north - CATALONIA_BOUNDS.south) *
        seededRandom(`${actorId}|${priorityId}|lat|${attempt}`);

    const point: [number, number] = [lng, lat];
    if (pointInCatalonia(point, boundary)) {
      return point;
    }
  }

  // Fallback to the center only if we exhaust attempts (should be extremely rare).
  return CATALONIA_BOUNDS.center;
}

export function buildActorPositions(
  records: NormalizedRecord[],
  priorityIds: string[],
  boundary: CataloniaBoundary
): Record<string, Record<string, [number, number]>> {
  const ids = ["all", ...priorityIds];
  const out: Record<string, Record<string, [number, number]>> = {};

  for (const record of records) {
    const map: Record<string, [number, number]> = {};
    for (const priorityId of ids) {
      map[priorityId] = getActorPosition(record.id, priorityId, boundary);
    }
    out[record.id] = map;
  }

  return out;
}
