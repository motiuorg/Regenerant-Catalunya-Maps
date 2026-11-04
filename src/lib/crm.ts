import type { NormalizedRecord } from "./notion";
import { getPlace } from "./geo";
import {
  priorityAreaOptions as priorityAreaOptionsFromYaml,
  priorityColor as priorityColorFromYaml,
  loadPriorities,
} from "./priorities";

export interface CrmActor {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  website: string | null;
  publicEmail: string | null;
  linkedin: string | null;
  actorType: string | null;
  actorRoles: string[];
  secondTags: string[];
  thirdTags: string[];
  bioeconomySubcategories: string[];
  area2: string[];
  climateZone: string | null;
  themes: string[];
  ontologyTags: string[];
  relatedInitiatives: string[];
  relatedProjects: string[];
  relatedEvents: string[];
  relatedResources: string[];
  /** Resolved from the Notion `Place` property (type `place`) or Lat/Lng numbers; null when absent. */
  lat: number | null;
  lng: number | null;
  placeName: string | null;
  placeAddress: string | null;
}

export interface CrmProgram {
  id: string;
  name: string;
  description: string;
  whatItIs: string;
  website: string | null;
  area2: string[];
  agency: string | null;
  secondTags: string[];
  /** Explicit priority tags from the `3RDTAG` multi-select, when filled in the CRM. */
  explicitPriorities: string[];
  /** Free-form context/verification notes kept in the CRM (Notes property). */
  notes: string;
}

export interface CrmEvent {
  id: string;
  name: string;
  about: string;
  whatItIs: string;
  date: string;
  startDate: string | null;
  location: string;
  link: string | null;
  type: string | null;
  secondTags: string[];
}

export type CrmRecord = CrmActor | CrmProgram | CrmEvent;

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

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseDelimitedTitleCase(value: any): string[] {
  if (Array.isArray(value)) return value.map((v) => toTitleCase(String(v)));
  if (typeof value === "string") {
    return value
      .split(/[,;]/)
      .map((s) => toTitleCase(s.trim()))
      .filter(Boolean);
  }
  return [];
}

function toNullableString(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function formatDate(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const start = value.start ?? value.date ?? "";
    const end = value.end ?? "";
    if (start && end && start !== end) return `${start} → ${end}`;
    return String(start);
  }
  return String(value);
}

function extractStartDate(value: any): string | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null) {
    return value.start ?? value.date ?? null;
  }
  if (typeof value === "string") {
    const match = value.match(/^([^→]+)/);
    if (match) return match[1].trim();
  }
  return null;
}

export function normalizeRecord(record: NormalizedRecord): CrmActor {
  const props = record.properties;
  const place = getPlace(props);
  return {
    id: record.id,
    name: String(props["Name"] ?? "Untitled"),
    description: String(props["Description"] ?? ""),
    whyItMatters: String(props["SAP"] ?? ""),
    website: toNullableString(props["Website"]),
    publicEmail: toNullableString(props["Public Email"]),
    linkedin: toNullableString(props["LinkedIn"]),
    actorType: toNullableString(props["Agency"]),
    actorRoles: parseDelimitedTitleCase(props["Actor Role"]),
    secondTags: toStringArray(props["2NDTAG"]),
    thirdTags: toStringArray(props["3RDTAG"]),
    bioeconomySubcategories: parseDelimitedText(props["Bioeconomy sub-category"]),
    area2: toStringArray(props["Area2"]),
    climateZone: toNullableString(props["Climate zone"]),
    themes: toStringArray(props["Memes"]),
    ontologyTags: parseDelimitedText(props["Ontology Tags"]),
    relatedInitiatives: toStringArray(props["related programs and initiatives"]),
    relatedProjects: toStringArray(props["Projects & Areas"]),
    relatedEvents: toStringArray(props["Events"]),
    relatedResources: toStringArray(props["Artifacts"]),
    lat: place?.lat ?? null,
    lng: place?.lng ?? null,
    placeName: place?.name ?? null,
    placeAddress: place?.address ?? null,
  };
}

/** Map/directory rule (per Motiu CRM handoff, 2026-09-29): an actor counts as an
 *  organization when its `Agency` multi-select contains exactly "org" (the
 *  normalized string is comma-joined, e.g. "org,network/ecosystem"). */
export function isOrgActor(actor: CrmActor): boolean {
  return (actor.actorType ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes("org");
}

export function normalizeProgram(record: NormalizedRecord): CrmProgram {
  const props = record.properties;
  return {
    id: record.id,
    name: String(props["Name"] ?? "Untitled"),
    description: String(props["Description"] ?? ""),
    whatItIs: String(props["What it is"] ?? ""),
    website: toNullableString(
      props["Website"] ?? props["Link"] ?? props["URL"] ?? props["Website 1"] ?? props["Website 2"]
    ),
    area2: toStringArray(props["Area2"]),
    agency: toNullableString(props["Agency"]),
    secondTags: toStringArray(props["2NDTAG"]),
    explicitPriorities: toStringArray(props["3RDTAG"]),
    notes: String(props["Notes"] ?? ""),
  };
}

export function normalizeEvent(record: NormalizedRecord): CrmEvent {
  const props = record.properties;
  const dateValue = props["Date"];
  return {
    id: record.id,
    name: String(props["Event"] ?? props["Name"] ?? "Untitled"),
    about: String(props["About"] ?? ""),
    whatItIs: String(props["What it is"] ?? ""),
    date: formatDate(dateValue),
    startDate: extractStartDate(dateValue),
    location: String(props["Location"] ?? ""),
    link: toNullableString(props["Link"]),
    type: toNullableString(props["Type"]),
    secondTags: toStringArray(props["Select"] ?? props["2NDTAG"] ?? props["Tag"] ?? props["Tags"]),
  };
}

function hasTag(record: NormalizedRecord | CrmRecord, tag: string): boolean {
  if ("secondTags" in record && Array.isArray(record.secondTags)) {
    if (record.secondTags.some((t) => String(t).toLowerCase() === tag)) return true;
  }
  const props = (record as NormalizedRecord).properties ?? {};
  const candidates = [
    props["2NDTAG"],
    props["Select"],
    props["Tag"],
    props["Tags"],
  ];
  for (const value of candidates) {
    if (value === undefined || value === null) continue;
    const tags = toStringArray(value);
    if (tags.some((t) => String(t).toLowerCase() === tag)) return true;
  }
  return false;
}

export function hasCatbis(record: NormalizedRecord | CrmRecord): boolean {
  return hasTag(record, "catbis");
}

/** True when the record carries the `fluvia` second-order tag (plus CATBIS, as tagged in the CRM). */
export function hasFluvia(record: NormalizedRecord | CrmRecord): boolean {
  return hasTag(record, "fluvia");
}

export function hasBioeconomyMeme(record: NormalizedRecord | CrmRecord): boolean {
  const themes = "themes" in record && Array.isArray(record.themes)
    ? record.themes
    : undefined;
  if (themes) {
    return themes.some((t) => String(t).toLowerCase().includes("bioeconomy"));
  }
  const props = (record as NormalizedRecord).properties ?? {};
  const candidates = [props["Memes"], props["memes"], props["Themes"], props["themes"]];
  for (const value of candidates) {
    if (value === undefined || value === null) continue;
    const tags = Array.isArray(value) ? value.map(String) : [String(value)];
    if (tags.some((t) => t.toLowerCase().includes("bioeconomy"))) return true;
  }
  return false;
}

export function uniqueValues<T extends Record<string, any>>(
  records: T[],
  key: keyof T
): string[] {
  const values = new Set<string>();
  for (const record of records) {
    const v = record[key];
    if (Array.isArray(v)) {
      for (const item of v as any[]) values.add(String(item));
    } else if (v !== null && v !== undefined && v !== "") {
      values.add(String(v));
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export const priorityAreaOptions = priorityAreaOptionsFromYaml();

export function priorityColor(priorityId: string): string {
  return priorityColorFromYaml(priorityId);
}

export function inferPriorityTags(record: NormalizedRecord | CrmProgram): string[] {
  const priorities = loadPriorities();
  const props = ("properties" in record ? record.properties : record) as any;

  // An explicit `3RDTAG` (or an already-normalized equivalent) is
  // authoritative — it lets the CRM decide, instead of guessing from copy.
  const explicit = [
    ...toStringArray(props["3RDTAG"]),
    ...(Array.isArray(props.explicitPriorities) ? props.explicitPriorities : []),
  ];
  if (explicit.length) {
    const picked = explicit
      .map((tag) => {
        const wanted = String(tag).toLowerCase();
        return priorities.find(
          (p) => String(p.id).toLowerCase() === wanted || String(p.slug).toLowerCase() === wanted,
        )?.id;
      })
      .filter(Boolean) as string[];
    if (picked.length) return Array.from(new Set(picked));
  }

  // Fall back to keyword matching. Callers pass a *normalized* record (camelCase,
  // no `properties`), so read both shapes — reading only the raw CRM keys made
  // the haystack permanently empty and every priority report "0 programs".
  const haystack = [
    props["Name"] ?? props.name ?? "",
    props["Description"] ?? props.description ?? "",
    props["What it is"] ?? props.whatItIs ?? "",
    props["Agency"] ?? props.agency ?? "",
    ...(Array.isArray(props["Memes"]) ? props["Memes"] : [props["Memes"] ?? ""]),
  ]
    .map((v) => String(v).toLowerCase())
    .join(" ");
  const matched = new Set<string>();
  for (const priority of priorities) {
    for (const keyword of priority.keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        matched.add(priority.id);
        break;
      }
    }
  }
  return Array.from(matched);
}

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
