// רחובות בישראל - data.gov.il resource 9ad3862c-8391-4b2f-84a4-2d4c68625f4b (~63K שורות).
// streets.json בפורמט קומפקטי: { [cityCode]: [streetName, streetCode][] }.
import rawStreets from "./data/streets.json";
import { cityByName } from "./cities";
import { rankSearch } from "./search";

export interface Street {
  name: string;
  code: number;
}

const parsed = new Map<number, Street[]>();

export function streetsOfCity(cityCode: number): Street[] {
  const cached = parsed.get(cityCode);
  if (cached) return cached;
  const raw = (rawStreets as unknown as Record<string, [string, number][]>)[String(cityCode)];
  const streets = raw ? raw.map(([name, code]) => ({ name, code })) : [];
  parsed.set(cityCode, streets);
  return streets;
}

/** מקבל סמל ישוב או שם ישוב ומחזיר את סמל הישוב, או null. */
export function resolveCityCode(city: string): number | null {
  const asNum = Number(city.trim());
  if (Number.isInteger(asNum) && asNum > 0) return asNum;
  return cityByName(city)?.code ?? null;
}

export function searchStreets(city: string, q: string): Street[] {
  const code = resolveCityCode(city);
  if (!code) return [];
  return rankSearch(streetsOfCity(code), q, (s) => s.name);
}
