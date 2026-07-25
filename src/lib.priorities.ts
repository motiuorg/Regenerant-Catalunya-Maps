import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";
import type { NormalizedRecord } from "./notion";

export interface Priority {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  keywords: string[];
}

export function loadPriorities(): Priority[] {
  const filePath = path.join(process.cwd(), "src/data/priorities.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as { priorities: Priority[] };
  return parsed.priorities ?? [];
}

export function inferPriorities(
  record: NormalizedRecord,
  priorities: Priority[]
): string[] {
  const haystack = extractSearchText(record).toLowerCase();
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

function extractSearchText(record: NormalizedRecord): string {
  const props = record.properties;
  const fields = [
    "Name",
    "Description",
    "SAP",
    "Agency",
    "Area1",
    "Area2",
    "Memes",
    "2NDTAG",
  ];

  return fields
    .map((key) => {
      const value = props[key];
      if (value === null || value === undefined) return "";
      if (Array.isArray(value)) return value.join(" ");
      return String(value);
    })
    .join(" ");
}
