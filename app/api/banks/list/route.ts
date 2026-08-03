// GET /api/banks/list → { banks: [{ code, name, logo }] } - רשימת הבנקים הקנונית
import { NextResponse } from "next/server";
import { BANKS } from "@/lib/israel-data/banks";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    banks: BANKS.map((b) => ({
      code: b.code,
      name: b.name,
      logo: `/logos/banks/${b.logoKey}.svg`,
    })),
  });
}
