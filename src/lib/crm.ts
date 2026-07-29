import type { NormalizedRecord } from "./notion";

export interface CrmActor {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  website: string | null;
  publicEmail: string | null;
  linkedin: string | null;
  actorType: string | null;
  actorRole: string | null;
  secondTags: string[];
  thirdTags: string[];
  area2: string[];
  climateZone: string | null;
  themes: string[];
  ontologyTags: string[];
  relatedInitiatives: string[];
  relatedProjects: string[];
  relatedEvents: string[];
  relatedResources: string[];
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

function toNullableString(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

export function normalizeRecord(record: NormalizedRecord): CrmActor {
  const props = record.properties;
  return {
    id: record.id,
    name: String(props["Name"] ?? "Untitled"),
    description: String(props["Description"] ?? ""),
    whyItMatters: String(props["SAP"] ?? ""),
    website: toNullableString(props["Website"]),
    publicEmail: toNullableString(props["Public Email"]),
    linkedin: toNullableString(props["LinkedIn"]),
    actorType: toNullableString(props["Agency"]),
    actorRole: toNullableString(props["Actor Role"]),
    secondTags: toStringArray(props["2NDTAG"]),
    thirdTags: toStringArray(props["3RDTAG"]),
    area2: toStringArray(props["Area2"]),
    climateZone: toNullableString(props["Climate zone"]),
    themes: toStringArray(props["Memes"]),
    ontologyTags: parseDelimitedText(props["Ontology Tags"]),
    relatedInitiatives: toStringArray(props["related programs and initiatives"]),
    relatedProjects: toStringArray(props["Projects & Areas"]),
    relatedEvents: toStringArray(props["Events"]),
    relatedResources: toStringArray(props["Artifacts"]),
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
    } else if (v !== null && v !== undefined && v !== "") {
      values.add(String(v));
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export const priorityAreaOptions = [
  "Ecosystems",
  "Food",
  "Energy",
  "Water",
  "Circular",
  "Social",
];

export const territoryOptions = [
  "regional",
  "Barcelona province",
  "Girona province",
  "Lleida province",
  "Tarragona province",
  "Alt Camp",
  "Alt Empordà",
  "Alt Penedès",
  "Alt Urgell",
  "Alta Ribagorça",
  "Anoia",
  "Aran",
  "Bages",
  "Baix Camp",
  "Baix Ebre",
  "Baix Empordà",
  "Baix Llobregat",
  "Baix Penedès",
  "Barcelonès",
  "Berguedà",
  "Cerdanya",
  "Conca de Barberà",
  "Garraf",
  "Garrigues",
  "Garrotxa",
  "Gironès",
  "Lluçanès",
  "Maresme",
  "Moianès",
  "Montsià",
  "Noguera",
  "Osona",
  "Pallars Jussà",
  "Pallars Sobirà",
  "Pla de l'Estany",
  "Pla d'Urgell",
  "Priorat",
  "Ribera d'Ebre",
  "Ripollès",
  "Segarra",
  "Segrià",
  "La Selva",
  "Solsonès",
  "Tarragonès",
  "Terra Alta",
  "Urgell",
  "Vallès Occidental",
  "Vallès Oriental",
];

export function priorityColor(priorityId: string): string {
  const map: Record<string, string> = {
    Ecosystems: "#447932",
    Food: "#DC7221",
    Energy: "#C92637",
    Water: "#4C6BC1",
    Circular: "#8161BF",
    Social: "#DC697F",
  };
  return map[priorityId] ?? "#1d1a16";
}
