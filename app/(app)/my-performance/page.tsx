/**
 * "הביצועים שלי" - כרטיס הציונים האישי של הנציג מתוך ניתוחי הבינה.
 * שרת בלבד (Prisma ישירות), 30 הימים האחרונים של המשתמש הנוכחי:
 * ציון ממוצע + עמודה ליום · אחוז עמידה בכל כלל בקרה · 3 נושאי האימון החוזרים ·
 * 20 השיחות המנותחות האחרונות. כל שדות ה-JSON נקראים בהגנה - ניתוח פגום לא מפיל דף.
 */
import Link from "next/link";
import { TrendingUp, Sparkles, ShieldCheck, GraduationCap, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAYS = 30;

interface ComplianceItem { ruleName?: string; passed?: boolean }
interface CoachingItem { title?: string }

function parseArray<T>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDuration(sec: number | null): string {
  if (!sec) return "-";
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function scoreChipClass(score: number | null): string {
  if (score === null) return "b-chip-gray";
  if (score >= 80) return "b-chip-green";
  if (score >= 55) return "b-chip-orange";
  return "b-chip-red";
}

export default async function MyPerformancePage() {
  const me = await currentUser();
  if (!me) {
    return <div className="p-8 text-sm font-bold text-bingo-gray-500">משתמש לא מזוהה</div>;
  }

  const from = new Date();
  from.setDate(from.getDate() - (DAYS - 1));
  from.setHours(0, 0, 0, 0);

  const calls = await db.call.findMany({
    where: { userId: me.id, dialedAt: { gte: from }, analysis: { isNot: null } },
    include: {
      analysis: true,
      lead: { select: { id: true, fullName: true } },
    },
    orderBy: { dialedAt: "desc" },
  });

  const scored = calls.filter((c) => typeof c.analysis?.score === "number");
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, c) => s + (c.analysis!.score as number), 0) / scored.length)
    : null;

  /* ----- עמודה ליום ----- */
  const buckets = new Map<string, { sum: number; n: number }>();
  for (const c of scored) {
    const k = dayKey(c.dialedAt);
    const b = buckets.get(k) ?? { sum: 0, n: 0 };
    b.sum += c.analysis!.score as number;
    b.n += 1;
    buckets.set(k, b);
  }
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const b = buckets.get(dayKey(d));
    return {
      label: d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" }),
      avg: b ? Math.round(b.sum / b.n) : null,
      count: b?.n ?? 0,
    };
  });

  /* ----- עמידה בכללי הבקרה ----- */
  const ruleStats = new Map<string, { passed: number; total: number }>();
  for (const c of calls) {
    for (const item of parseArray<ComplianceItem>(c.analysis?.complianceJson)) {
      const name = (item.ruleName || "").trim();
      if (!name) continue;
      const s = ruleStats.get(name) ?? { passed: 0, total: 0 };
      s.total += 1;
      if (item.passed) s.passed += 1;
      ruleStats.set(name, s);
    }
  }
  const rules = Array.from(ruleStats.entries())
    .map(([name, s]) => ({ name, pct: Math.round((s.passed / s.total) * 100), total: s.total }))
    .sort((a, b) => a.pct - b.pct);

  /* ----- נושאי האימון החוזרים ----- */
  const themeCounts = new Map<string, number>();
  for (const c of calls) {
    for (const item of parseArray<CoachingItem>(c.analysis?.coachingJson)) {
      const t = (item.title || "").trim();
      if (!t) continue;
      themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
    }
  }
  const themes = Array.from(themeCounts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const recent = calls.slice(0, 20);
  const totalViolations = calls.reduce((s, c) => s + (c.analysis?.violationCount ?? 0), 0);
  const maxDay = Math.max(1, ...days.map((d) => d.avg ?? 0));

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ===== כותרת ===== */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="b-glass-ico size-11 rounded-2xl flex items-center justify-center">
          <TrendingUp className="size-5 text-bingo-black" />
        </span>
        <div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
            הביצועים שלי
          </h1>
          <div className="text-[12.5px] font-semibold text-bingo-gray-500 mt-1.5">
            {me.name} · 30 הימים האחרונים · מבוסס על ניתוחי הבינה
          </div>
        </div>
      </div>

      {calls.length === 0 ? (
        <div className="b-obsidian rounded-[28px] p-10 text-center text-white b-spring-in">
          <Sparkles className="size-11 mx-auto mb-4 text-bingo-green" />
          <div className="text-2xl font-black mb-1.5">עוד אין שיחות מנותחות</div>
          <div className="text-[13px] text-white/60 font-semibold max-w-[440px] mx-auto">
            אחרי שתנהל שיחות בתותח, הבינה תתמלל ותנתח אותן - וכאן יופיעו הציון שלך,
            העמידה בכללי הבקרה והנושאים שכדאי לחזק.
          </div>
          <Link
            href="/dialer"
            className="b-lift inline-block mt-6 rounded-full bg-bingo-green text-bingo-black px-6 py-2.5 text-[13px] font-black"
          >
            לתותח השיחות
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ===== מספרי-על ===== */}
          <div className="b-glass rounded-[22px] px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "ציון ממוצע", value: avgScore === null ? "-" : String(avgScore) },
              { label: "שיחות שנותחו", value: String(calls.length) },
              { label: "חריגות בקרה", value: String(totalViolations) },
              {
                label: "עמידה ממוצעת",
                value: rules.length
                  ? `${Math.round(rules.reduce((s, r) => s + r.pct, 0) / rules.length)}%`
                  : "-",
              },
            ].map(({ label, value }) => (
              <div key={label} className="leading-tight">
                <div className="text-[26px] font-black text-bingo-black tabular-nums">{value}</div>
                <div className="text-[11px] font-bold text-bingo-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* ===== עמודות ליום ===== */}
          <div className="b-card rounded-[22px] p-5">
            <div className="text-[13px] font-black text-bingo-black mb-3">ציון יומי</div>
            <div className="flex items-end gap-[3px] h-[110px]" dir="ltr">
              {days.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[4px] transition-all"
                  style={{
                    height: d.avg === null ? "4px" : `${Math.max(6, (d.avg / maxDay) * 100)}%`,
                    background:
                      d.avg === null
                        ? "rgba(0,0,0,.07)"
                        : d.avg >= 80
                          ? "var(--color-bingo-green, #50FF0A)"
                          : d.avg >= 55
                            ? "var(--color-status-orange, #F09A3E)"
                            : "var(--color-status-red, #E0483C)",
                  }}
                  title={d.avg === null ? `${d.label} - אין שיחות` : `${d.label} · ציון ${d.avg} · ${d.count} שיחות`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10.5px] font-bold text-bingo-gray-400 mt-2">
              <span>{days[0]?.label}</span>
              <span>{days[days.length - 1]?.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ===== עמידה בכללים ===== */}
            <div className="b-card rounded-[22px] p-5">
              <div className="flex items-center gap-1.5 text-[13px] font-black text-bingo-black mb-3">
                <ShieldCheck className="size-4" /> עמידה בכללי הבקרה
              </div>
              {rules.length === 0 ? (
                <p className="text-[12.5px] font-semibold text-bingo-gray-400">אין עדיין תוצאות בקרה.</p>
              ) : (
                <div className="space-y-2.5">
                  {rules.map((r) => (
                    <div key={r.name}>
                      <div className="flex items-center justify-between text-[12px] font-bold text-bingo-gray-600 mb-1">
                        <span className="truncate">{r.name}</span>
                        <span className="tabular-nums shrink-0 mr-2">{r.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-black/8 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.pct}%`,
                            background:
                              r.pct >= 85
                                ? "var(--color-bingo-green, #50FF0A)"
                                : r.pct >= 60
                                  ? "var(--color-status-orange, #F09A3E)"
                                  : "var(--color-status-red, #E0483C)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== נושאי אימון ===== */}
            <div className="b-card rounded-[22px] p-5">
              <div className="flex items-center gap-1.5 text-[13px] font-black text-bingo-black mb-3">
                <GraduationCap className="size-4" /> מה חוזר על עצמו
              </div>
              {themes.length === 0 ? (
                <p className="text-[12.5px] font-semibold text-bingo-gray-400">אין עדיין הערות אימון.</p>
              ) : (
                <div className="space-y-2">
                  {themes.map((t, i) => (
                    <div
                      key={t.title}
                      className={cn(
                        "rounded-2xl px-4 py-3 flex items-center gap-3",
                        i === 0 ? "b-tint-peach" : i === 1 ? "b-tint-sand" : "b-tint-sky",
                      )}
                    >
                      <span className="text-[20px] font-black text-bingo-black tabular-nums shrink-0">
                        {t.count}
                      </span>
                      <span className="text-[13.5px] font-black text-bingo-black">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== השיחות האחרונות ===== */}
          <div className="b-card rounded-[22px] p-5">
            <div className="flex items-center gap-1.5 text-[13px] font-black text-bingo-black mb-3">
              <Phone className="size-4" /> השיחות המנותחות האחרונות
            </div>
            <div className="divide-y divide-bingo-gray-100">
              {recent.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2.5 flex-wrap">
                  <span className="text-[11.5px] font-bold text-bingo-gray-400 tabular-nums w-[86px] shrink-0">
                    {c.dialedAt.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })}{" "}
                    {c.dialedAt.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <Link
                    href={`/calls/${c.id}`}
                    className="text-[13.5px] font-black text-bingo-black hover:underline min-w-0 truncate flex-1"
                  >
                    {c.lead?.fullName ?? "שיחה ללא ליד"}
                  </Link>
                  <span className="text-[11.5px] font-bold text-bingo-gray-400 tabular-nums shrink-0">
                    {fmtDuration(c.duration)}
                  </span>
                  {(c.analysis?.violationCount ?? 0) > 0 && (
                    <span className="b-chip b-chip-red text-[10.5px] shrink-0">
                      {c.analysis!.violationCount} חריגות
                    </span>
                  )}
                  <span className={cn("b-chip text-[11px] tabular-nums shrink-0", scoreChipClass(c.analysis?.score ?? null))}>
                    {c.analysis?.score ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
