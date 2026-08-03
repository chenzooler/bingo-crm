// איתור מיקוד - שירות "איתור מיקוד" הרשמי של דואר ישראל.
// זרימה (זהה לאתר doar.israelpost.co.il/locatezip, אומתה מול ה-XHR של האתר, 08/2026):
//   1. GET /mypost-zip/GetCities-lang?CityStartsWith=&Lang=HE      → { Result: [{ id, n, divided, zip }] }
//   2. GET /mypost-zip/GetStreets-lang?CityID=&SearchMode=ID-StartsWith&StartsWith=&Lang=HE
//   3. GET /mypost-zip/SearchZip-Lang?CityID=&StreetID=&House=&ByMaanimID=true&Lang=HE → { Result: { zip, msgtype } }
// Host: apimftprd.israelpost.co.il. המפתח (Ocp-Apim-Subscription-Key) הוא מפתח צד-לקוח
// ציבורי המוטמע ב-bundle של האתר; ניתן לעדכון דרך ISRAEL_POST_APIM_KEY אם ירוטט.
// אם השירות לא זמין - מוחזר provider: "unavailable" וה-UI יציג שדה מיקוד ידני. אין להמציא מיקוד.

const BASE = "https://apimftprd.israelpost.co.il/mypost-zip";
const APIM_KEY = process.env.ISRAEL_POST_APIM_KEY || "5ccb5b137e7444d885be752eda7f767a";

export interface ZipResult {
  zip: string | null;
  provider: "israelpost" | "unavailable";
}

// מטמון בזיכרון ל-24 שעות
const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; result: ZipResult }>();

interface PostCity {
  id: string;
  n: string;
  divided: boolean;
  zip: string;
}
interface PostStreet {
  id: string;
  n: string;
}

async function postGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, {
      headers: { "Ocp-Apim-Subscription-Key": APIM_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { ReturnCode: number; Result: T | null };
    if (json.ReturnCode !== 0) return null;
    return json.Result;
  } catch {
    return null;
  }
}

function pickByName<T extends { n: string }>(items: T[], name: string): T | null {
  if (!items.length) return null;
  const trimmed = name.trim();
  return items.find((i) => i.n.trim() === trimmed) ?? items[0];
}

/**
 * איתור מיקוד לכתובת. city/street בעברית כפי שמופיעים במאגר הישובים/רחובות.
 * מחזיר { zip: null, provider: "unavailable" } אם השירות נכשל - בלי לזרוק.
 */
export async function lookupZip(city: string, street: string, house: string): Promise<ZipResult> {
  const key = `${city.trim()}|${street.trim()}|${house.trim()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.result;

  const result = await lookupZipUncached(city, street, house);
  // לא שומרים במטמון כישלונות שירות - רק תוצאות אמיתיות (כולל "לא נמצא")
  if (result.provider === "israelpost") cache.set(key, { at: Date.now(), result });
  return result;
}

async function lookupZipUncached(city: string, street: string, house: string): Promise<ZipResult> {
  const unavailable: ZipResult = { zip: null, provider: "unavailable" };
  if (!city.trim()) return unavailable;

  const cities = await postGet<PostCity[]>("GetCities-lang", {
    CityStartsWith: city.trim(),
    Lang: "HE",
  });
  if (cities === null) return unavailable;
  const matchedCity = pickByName(cities, city);
  if (!matchedCity) return { zip: null, provider: "israelpost" };

  // ישוב שאינו מחולק לרחובות - מיקוד אחיד לכל הישוב
  if (!matchedCity.divided && matchedCity.zip && matchedCity.zip !== "0000000") {
    return { zip: matchedCity.zip, provider: "israelpost" };
  }

  if (!street.trim()) return { zip: null, provider: "israelpost" };
  const streets = await postGet<PostStreet[]>("GetStreets-lang", {
    CityID: matchedCity.id,
    CityName: "",
    SearchMode: "ID-StartsWith",
    StartsWith: street.trim(),
    Lang: "HE",
  });
  if (streets === null) return unavailable;
  const matchedStreet = pickByName(streets, street);
  if (!matchedStreet) return { zip: null, provider: "israelpost" };

  const search = await postGet<{ zip: string | null; msgtype: string }>("SearchZip-Lang", {
    CityID: matchedCity.id,
    StreetID: matchedStreet.id,
    House: house.trim(),
    Entry: "",
    POB: "",
    ByMaanimID: "true",
    Lang: "HE",
  });
  if (search === null) return unavailable;
  const zip = search.zip && /^\d{7}$/.test(search.zip) ? search.zip : null;
  return { zip, provider: "israelpost" };
}
