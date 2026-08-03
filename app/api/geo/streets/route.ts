// GET /api/geo/streets?city=<סמל או שם>&q= → { streets: [{ name, code }] }
import { NextRequest, NextResponse } from "next/server";
import { searchStreets } from "@/lib/israel-data/streets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const city = sp.get("city") ?? "";
  const q = sp.get("q") ?? "";
  if (!city.trim()) return NextResponse.json({ streets: [] });
  return NextResponse.json({ streets: searchStreets(city, q) });
}
