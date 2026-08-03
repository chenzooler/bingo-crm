// ישובים בישראל - נתוני משרד הפנים (data.gov.il, resource 5c78e9fa-c2e2-4771-93ff-7f400a12f7ba).
// הקובץ cities.json נוצר ע"י scripts/fetch-israel-data.ts בפורמט קומפקטי: [name, code][].
import rawCities from "./data/cities.json";
import { rankSearch } from "./search";

export interface City {
  name: string;
  code: number;
}

let cache: City[] | null = null;

export function allCities(): City[] {
  if (!cache) {
    cache = (rawCities as unknown as [string, number][]).map(([name, code]) => ({ name, code }));
  }
  return cache;
}

export function searchCities(q: string): City[] {
  return rankSearch(allCities(), q, (c) => c.name);
}

export function cityByCode(code: number): City | undefined {
  return allCities().find((c) => c.code === code);
}

export function cityByName(name: string): City | undefined {
  const trimmed = name.trim();
  return allCities().find((c) => c.name === trimmed);
}
