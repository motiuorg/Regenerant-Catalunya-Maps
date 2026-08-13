import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

export type I18nString = { en: string; ca?: string; es?: string };

export type IndicatorStatus =
  | "in_overshoot"
  | "under_strain"
  | "holding"
  | "improving";

export type IndicatorTrend = "improving" | "worsening" | "stable";

export type IndicatorSourceType =
  | "socrata"
  | "idescat"
  | "static"
  | "derived";

export interface IndicatorSource {
  type: IndicatorSourceType;
  label: string;
  url: string;
  license: string;
  accessed: string;
  domain?: string;
  dataset?: string;
  query?: string;
}

export interface Indicator {
  id: string;
  priority: string;
  label: I18nString;
  value: string;
  unit: string;
  status: IndicatorStatus;
  trend: IndicatorTrend;
  threshold: string;
  thresholdLabel: I18nString;
  confidence: "high" | "medium" | "low";
  source: IndicatorSource;
  lastVerified: string;
  note?: I18nString;
}

export interface IndicatorsRegistry {
  indicators: Indicator[];
}

export function loadIndicators(): Indicator[] {
  const filePath = path.join(process.cwd(), "src/data/indicators-static.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as IndicatorsRegistry;
  return parsed.indicators ?? [];
}

export function getIndicatorById(id: string): Indicator | undefined {
  return loadIndicators().find((i) => i.id === id);
}

export function getIndicatorsByPriority(priorityId: string): Indicator[] {
  return loadIndicators().filter((i) => i.priority === priorityId);
}

export function getHeadlineIndicator(priorityId: string): Indicator | undefined {
  const indicators = getIndicatorsByPriority(priorityId);
  return indicators[0];
}
