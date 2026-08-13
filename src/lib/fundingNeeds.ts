import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

export type I18nString = { en: string; ca?: string; es?: string };

export interface FundingItem {
  name: I18nString;
  lead: I18nString;
  territory?: I18nString;
  budget?: I18nString;
  status: "running" | "open-ask" | "funded" | "closed";
  note?: I18nString;
  channel?: { label: I18nString; url: string };
}

export interface FundingTier {
  id: string;
  name: I18nString;
  lede?: I18nString;
  items: FundingItem[];
}

export interface FundingNeedsRegistry {
  title?: I18nString;
  intro?: I18nString;
  tiers: FundingTier[];
  footnote?: I18nString;
  sources?: Array<{ label: string; url: string; accessed: string }>;
}

export function loadFundingNeeds(): FundingNeedsRegistry {
  const filePath = path.join(process.cwd(), "src/data/funding-needs.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as FundingNeedsRegistry;
  return {
    title: parsed.title,
    intro: parsed.intro,
    tiers: parsed.tiers ?? [],
    footnote: parsed.footnote,
    sources: parsed.sources ?? [],
  };
}
