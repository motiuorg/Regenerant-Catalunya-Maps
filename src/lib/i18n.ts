import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

export type I18nString = { en: string; ca?: string; es?: string };
export type Lang = "en" | "ca" | "es";

export type I18nDict = Record<string, I18nString>;

/** Load the shared UI strings dictionary (src/data/i18n.yaml). */
export function loadI18n(): I18nDict {
  const filePath = path.join(process.cwd(), "src/data/i18n.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as Record<string, any>;
  const flat: I18nDict = {};
  const walk = (prefix: string, node: any) => {
    if (!node || typeof node !== "object") return;
    if (typeof node.en === "string") {
      flat[prefix] = { en: node.en, ca: node.ca, es: node.es };
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      walk(prefix ? `${prefix}.${key}` : key, value);
    }
  };
  walk("", parsed);
  return flat;
}

/** Server-side helper: pick the string for a language (falls back to en). */
export function t(obj: I18nString | undefined, lang: Lang = "en"): string {
  if (!obj) return "";
  return obj[lang] || obj.en || "";
}
