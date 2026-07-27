// GET /api/dialer/next — הליד הבא בתור התותח + ספירות + סטטיסטיקת היום.
// ?exclude=1,2,3 — לידים שדולגו בסשן הנוכחי (לא יוגשו שוב).
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { nextInQueue } from "@/lib/dialer/queue";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "משתמש לא מזוהה" }, { status: 401 });

  const exclude = (req.nextUrl.searchParams.get("exclude") ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);

  const result = await nextInQueue(me.id, exclude);
  return NextResponse.json(result);
}
