// GET /api/banks/branches?bank=<code>&q= → { branches: [{ code, name, city, label }] }
// label = "<קוד> <שם>" למשל "675 כפר יונה". q תואם תחילית קוד או "מכיל" בשם/עיר.
import { NextRequest, NextResponse } from "next/server";
import { searchBranches } from "@/lib/israel-data/banks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const bank = Number(sp.get("bank") ?? "");
  const q = sp.get("q") ?? "";
  if (!Number.isInteger(bank) || bank <= 0) return NextResponse.json({ branches: [] });
  return NextResponse.json({
    branches: searchBranches(bank, q).map((b) => ({
      code: b.code,
      name: b.name,
      city: b.city,
      label: b.label,
    })),
  });
}
