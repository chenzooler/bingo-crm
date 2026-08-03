// scripts/fetch-israel-data.ts
// מוריד נתוני עזר ישראליים מ-data.gov.il וכותב JSON קומפקטי ל-lib/israel-data/data/.
// הרצה: npx tsx scripts/fetch-israel-data.ts
// מקורות (CKAN datastore_search):
//   ישובים:  5c78e9fa-c2e2-4771-93ff-7f400a12f7ba (משרד הפנים)
//   רחובות:  9ad3862c-8391-4b2f-84a4-2d4c68625f4b (~63K שורות)
//   סניפי בנקים: 2202bada-4baf-45f5-aa61-8c5bad9646d3 (בנק ישראל)
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://data.gov.il/api/3/action/datastore_search";
const OUT_DIR = join(__dirname, "..", "lib", "israel-data", "data");

const CITIES_RESOURCE = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";
const STREETS_RESOURCE = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b";
const BRANCHES_RESOURCE = "2202bada-4baf-45f5-aa61-8c5bad9646d3";

async function fetchAll(resourceId: string, pageSize = 32000): Promise<Record<string, unknown>[]> {
  const records: Record<string, unknown>[] = [];
  let offset = 0;
  for (;;) {
    const url = `${BASE}?resource_id=${resourceId}&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const json = (await res.json()) as {
      success: boolean;
      result: { records: Record<string, unknown>[]; total: number };
    };
    if (!json.success) throw new Error(`CKAN failure for ${url}`);
    records.push(...json.result.records);
    offset += json.result.records.length;
    if (json.result.records.length === 0 || offset >= json.result.total) break;
    process.stdout.write(`  ...${offset}/${json.result.total}\r`);
  }
  return records;
}

const trim = (v: unknown) => String(v ?? "").trim();
const num = (v: unknown) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
};

async function buildCities() {
  console.log("Fetching cities...");
  const rows = await fetchAll(CITIES_RESOURCE);
  // פורמט קומפקטי: [name, code][]
  const seen = new Set<number>();
  const cities: [string, number][] = [];
  for (const r of rows) {
    const name = trim(r["שם_ישוב"]);
    const code = num(r["סמל_ישוב"]);
    if (!name || !code || seen.has(code)) continue;
    seen.add(code);
    cities.push([name, code]);
  }
  cities.sort((a, b) => a[0].localeCompare(b[0], "he"));
  writeFileSync(join(OUT_DIR, "cities.json"), JSON.stringify(cities));
  console.log(`Cities: ${cities.length}`);
  return cities.length;
}

async function buildStreets() {
  console.log("Fetching streets...");
  const rows = await fetchAll(STREETS_RESOURCE);
  // פורמט קומפקטי: { [cityCode]: [streetName, streetCode][] }
  const byCity: Record<string, [string, number][]> = {};
  let count = 0;
  for (const r of rows) {
    const cityCode = num(r["סמל_ישוב"]);
    const name = trim(r["שם_רחוב"]);
    const code = num(r["סמל_רחוב"]);
    if (!cityCode || !name) continue;
    (byCity[cityCode] ||= []).push([name, code]);
    count++;
  }
  for (const k of Object.keys(byCity)) byCity[k].sort((a, b) => a[0].localeCompare(b[0], "he"));
  writeFileSync(join(OUT_DIR, "streets.json"), JSON.stringify(byCity));
  console.log(`Streets: ${count} in ${Object.keys(byCity).length} cities`);
  return count;
}

async function buildBranches() {
  console.log("Fetching bank branches...");
  const rows = await fetchAll(BRANCHES_RESOURCE);
  // פורמט קומפקטי: [bankCode, branchCode, branchName, city, address][]
  const branches: [number, number, string, string, string][] = [];
  for (const r of rows) {
    const bankCode = num(r["Bank_Code"]);
    const branchCode = num(r["Branch_Code"]);
    const name = trim(r["Branch_Name"]);
    // סניפים סגורים - מסומנים ב-Close_Date
    if (trim(r["Close_Date"])) continue;
    if (!bankCode || !name) continue;
    branches.push([bankCode, branchCode, name, trim(r["City"]), trim(r["Branch_Address"])]);
  }
  branches.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  writeFileSync(join(OUT_DIR, "branches.json"), JSON.stringify(branches));
  console.log(`Branches: ${branches.length}`);
  return branches.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  await buildCities();
  await buildStreets();
  await buildBranches();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
