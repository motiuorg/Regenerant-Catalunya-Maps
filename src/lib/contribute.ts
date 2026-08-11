import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

export type I18nString = { en: string; ca?: string };

export interface ContributeLink {
  label: string;
  url: string;
  kind?: "portal" | "platform" | "public" | "finance" | "funder";
  mapped?: boolean;
  note?: I18nString;
}

export interface ContributeModality {
  id: string;
  order: number;
  name: I18nString;
  oneLiner?: I18nString;
  description?: I18nString;
  links: ContributeLink[];
}

export interface ContributeRegistry {
  intro?: I18nString;
  modalities: ContributeModality[];
  howToChoose?: {
    title?: I18nString;
    lede?: I18nString;
    options?: Array<{ when?: I18nString; then?: I18nString }>;
  };
  taxCallout?: {
    title?: I18nString;
    body?: I18nString;
  };
  upNext?: {
    title?: I18nString;
    body?: I18nString;
  };
  sources?: Array<{ label: string; url: string; accessed: string }>;
}

export function loadContribute(): ContributeRegistry {
  const filePath = path.join(process.cwd(), "src/data/contribute.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as ContributeRegistry;
  return {
    modalities: parsed.modalities ?? [],
    intro: parsed.intro,
    howToChoose: parsed.howToChoose,
    taxCallout: parsed.taxCallout,
    upNext: parsed.upNext,
    sources: parsed.sources ?? [],
  };
}
