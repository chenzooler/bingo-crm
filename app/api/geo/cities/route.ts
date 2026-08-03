// GET /api/geo/cities?q= → { cities: [{ name, code }] } - השלמה אוטומטית של ישובים
import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/israel-data/cities";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ cities: searchCities(q) });
}
