import type { NormalizedRecord } from "./notion";

export interface CrmActor {
  id: string;
  name: string;
  description: string;
  website: string | null;
  linkedin: string | null;
  secondTags: string[];
  thirdTags: string[];
  area2: string[];
  ontologyTags: string[];
  memes: string[];
  agency: string[];
}

function toStringArray(value: any): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

function parseDelimitedText(value: any): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string") {
    return value
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeRecord(record: NormalizedRecord): CrmActor {
  const props = record.properties;
  return {
    id: record.id,
    name: String(props["Name"] ?? "Untitled"),
    description: String(props["Description"] ?? props["SAP"] ?? ""),
    website: props["Website"] ?? null,
    linkedin: props["LinkedIn"] ?? null,
    secondTags: toStringArray(props["2NDTAG"]),
    thirdTags: toStringArray(props["3RDTAG"]),
    area2: toStringArray(props["Area2"]),
    ontologyTags: parseDelimitedText(props["Ontology Tags"]),
    memes: toStringArray(props["Memes"]),
    agency: toStringArray(props["Agency"]),
  };
}

export function hasCatbis(record: NormalizedRecord | CrmActor): boolean {
  const tags = "secondTags" in record ? record.secondTags : toStringArray(record.properties["2NDTAG"]);
  return tags.some((t) => t.toLowerCase() === "catbis");
}

export function uniqueValues(actors: CrmActor[], key: keyof CrmActor): string[] {
  const values = new Set<string>();
  for (const actor of actors) {
    const v = actor[key];
    if (Array.isArray(v)) {
      for (const item of v) values.add(item);
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}
