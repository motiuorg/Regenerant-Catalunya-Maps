import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";
import { flattenI18n, type I18nDict, type I18nString } from "./i18n";

export interface FluviaSource {
  label: I18nString;
  url: string;
  accessed: string;
}

export interface FluviaContent {
  nav: Record<string, I18nString>;
  home: any;
  priorities: any;
  orgs: Record<string, I18nString>;
  programs: Record<string, I18nString>;
  events: Record<string, I18nString>;
  sources: { title: I18nString; items: FluviaSource[] };
}

let cached: FluviaContent | null = null;

/** Load the Fluvià microsite content (src/data/fluvia.yaml), cached per build. */
export function loadFluviaContent(): FluviaContent {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "src/data/fluvia.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  cached = yaml.load(raw) as FluviaContent;
  return cached;
}

/**
 * Flat i18n dictionary for the Fluvià pages. Keys are namespaced under `fluv.`
 * so they never collide with the shared UI dictionary (src/data/i18n.yaml).
 */
export function fluviaDict(): I18nDict {
  const flat = flattenI18n(loadFluviaContent());
  const out: I18nDict = {};
  for (const [key, value] of Object.entries(flat)) {
    out[`fluv.${key}`] = value;
  }
  return out;
}

/** Server-side pick of the English string (the I18n engine swaps it client-side). */
export function t(obj?: I18nString | null): string {
  return obj?.en ?? "";
}
