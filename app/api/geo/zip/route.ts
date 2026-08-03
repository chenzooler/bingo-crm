// GET /api/geo/zip?city=&street=&house= → { zip: string | null, provider }
// provider: "israelpost" (חיפוש הצליח) או "unavailable" (השירות לא זמין - הצג שדה ידני)
import { NextRequest, NextResponse } from "next/server";
import { lookupZip } from "@/lib/israel-data/zip";
import { cityByCode } from "@/lib/israel-data/cities";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let city = sp.get("city") ?? "";
  // הכרטיס שולח קוד למ"ס - לדואר ישראל יש מזהים משלו, לכן מתרגמים קוד ← שם עיר
  if (/^\d+$/.test(city)) city = cityByCode(Number(city))?.name ?? city;
  const street = sp.get("street") ?? "";
  const house = sp.get("house") ?? "";
  const result = await lookupZip(city, street, house);
  return NextResponse.json(result);
}
