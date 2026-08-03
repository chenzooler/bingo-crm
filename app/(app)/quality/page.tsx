// לוח האיכות למנהל - הכל אגרגציה חיה מ-Prisma, בלי שום נתוני דמו.
// ?days=7|30|90 · ?sort=score|violations|calls · ?dir=asc|desc
import Link from "next/link";
import {
  ShieldCheck, Gauge, PhoneCall, AlertTriangle, Timer, TrendingUp, TrendingDown, ChevronLeft,
} from "lucide-react";
import { db } from "@/lib/db";
import { relativeTime } from "@/lib/utils";
import {
  parseArray, scoreBand, SCORE_CHIP, SCORE_BAR, SEVERITY_LABEL, SEVERITY_CHIP, SEVERITY_DOT,
  type ComplianceResult, type CoachingNote,
} from "@/components/manager/quality-utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

const PERIODS = [7, 30, 90] as const;

export default async function QualityDashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const days = (PERIODS as readonly number[]).includes(Number(one(sp.days))) ? Number(one(sp.days)) : 30;
  const sort = ["score", "violations", "calls"].includes(one(sp.sort)) ? one(sp.sort) : "score";
  const dir = one(sp.dir) === "asc" ? "asc" : "desc";

  const now = new Date();
  const since = new Date(now.getTime() - days * 86400000);
  const prevSince = new Date(now.getTime() - days * 2 * 86400000);

  // --- שליפות ---
  const [rows, prevRows, rules, alerts, criticalOpen] = await Promise.all([
    db.call.findMany({
      where: { dialedAt: { gte: since }, analysis: { isNot: null } },
      select: {
        id: true,
        duration: true,
        dialedAt: true,
        user: { select: { id: true, name: true, emoji: true } },
        analysis: {
          select: { score: true, violationCount: true, complianceJson: true, coachingJson: true },
        },
      },
      orderBy: { dialedAt: "asc" },
    }),
    db.call.findMany({
      where: { dialedAt: { gte: prevSince, lt: since }, analysis: { isNot: null } },
      select: { analysis: { select: { score: true } } },
    }),
    db.complianceRule.findMany({ orderBy: { sortOrder: "asc" } }),
    db.alert.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { agent: { select: { name: true, emoji: true } } },
    }),
    db.alert.count({ where: { severity: "critical", resolvedAt: null } }),
  ]);

  // --- KPI ---
  const scores = rows.map((r) => r.analysis?.score).filter((s): s is number => typeof s === "number");
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const prevScores = prevRows.map((r) => r.analysis?.score).filter((s): s is number => typeof s === "number");
  const prevAvg = prevScores.length ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length : null;
  const trend = avgScore !== null && prevAvg !== null ? avgScore - prevAvg : null;
  const talkMinutes = Math.round(rows.reduce((sum, r) => sum + (r.duration ?? 0), 0) / 60);

  // --- ניתוח תוצאות הבקרה (פירוק ה-JSON פעם אחת) ---
  let checksTotal = 0;
  let checksPassed = 0;
  const ruleStats = new Map<string, { name: string; pass: number; fail: number; severity: string }>();
  const agentMap = new Map<number, {
    id: number; name: string; emoji: string | null;
    calls: number; scoreSum: number; scoreCount: number; violations: number;
    pass: number; total: number; themes: Map<string, number>;
  }>();

  for (const r of rows) {
    const a = r.analysis;
    if (!a) continue;
    const uid = r.user?.id ?? 0;
    if (!agentMap.has(uid)) {
      agentMap.set(uid, {
        id: uid,
        name: r.user?.name ?? "ללא נציג",
        emoji: r.user?.emoji ?? null,
        calls: 0, scoreSum: 0, scoreCount: 0, violations: 0, pass: 0, total: 0, themes: new Map(),
      });
    }
    const ag = agentMap.get(uid)!;
    ag.calls += 1;
    if (typeof a.score === "number") { ag.scoreSum += a.score; ag.scoreCount += 1; }
    ag.violations += a.violationCount ?? 0;

    for (const c of parseArray<ComplianceResult>(a.complianceJson)) {
      const key = c.ruleId !== undefined ? `id:${c.ruleId}` : `name:${c.ruleName ?? "?"}`;
      const entry = ruleStats.get(key) ?? { name: c.ruleName ?? "כלל", pass: 0, fail: 0, severity: c.severity ?? "medium" };
      if (c.passed === false) entry.fail += 1; else entry.pass += 1;
      if (c.ruleName) entry.name = c.ruleName;
      ruleStats.set(key, entry);

      checksTotal += 1;
      ag.total += 1;
      if (c.passed !== false) { checksPassed += 1; ag.pass += 1; }
    }

    for (const note of parseArray<CoachingNote>(a.coachingJson)) {
      if (!note.title) continue;
      ag.themes.set(note.title, (ag.themes.get(note.title) ?? 0) + 1);
    }
  }

  const complianceRate = checksTotal > 0 ? (checksPassed / checksTotal) * 100 : null;

  const agentRows = [...agentMap.values()].map((a) => ({
    ...a,
    avg: a.scoreCount ? a.scoreSum / a.scoreCount : null,
    passRate: a.total ? (a.pass / a.total) * 100 : null,
    topTheme: [...a.themes.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null,
  }));

  agentRows.sort((a, b) => {
    const val = (r: typeof a) =>
      sort === "violations" ? r.violations : sort === "calls" ? r.calls : (r.avg ?? -1);
    const d = val(a) - val(b);
    return dir === "asc" ? d : -d;
  });

  // --- מגמת ציון יומית ---
  const dayBuckets = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const s = r.analysis?.score;
    if (typeof s !== "number") continue;
    const key = r.dialedAt.toISOString().slice(0, 10);
    const b = dayBuckets.get(key) ?? { sum: 0, count: 0 };
    b.sum += s; b.count += 1;
    dayBuckets.set(key, b);
  }
  const trendDays: Array<{ key: string; avg: number | null }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const b = dayBuckets.get(key);
    trendDays.push({ key, avg: b ? b.sum / b.count : null });
  }

  // --- כללי הבקרה כפי שהוגדרו + הסטטיסטיקה שנמצאה עליהם ---
  const ruleView = rules.map((rule) => {
    const stat = ruleStats.get(`id:${rule.id}`) ?? ruleStats.get(`name:${rule.name}`);
    const total = stat ? stat.pass + stat.fail : 0;
    return {
      id: rule.id,
      name: rule.name,
      severity: rule.severity,
      active: rule.active,
      pass: stat?.pass ?? 0,
      fail: stat?.fail ?? 0,
      rate: total > 0 ? ((stat?.pass ?? 0) / total) * 100 : null,
    };
  });
  // כללים שהמנוע החזיר אך כבר לא קיימים בהגדרות - עדיין מוצגים
  for (const [key, stat] of ruleStats) {
    if (key.startsWith("id:") && rules.some((r) => `id:${r.id}` === key)) continue;
    if (key.startsWith("name:") && rules.some((r) => `name:${r.name}` === key)) continue;
    const total = stat.pass + stat.fail;
    ruleView.push({
      id: -1, name: stat.name, severity: stat.severity, active: false,
      pass: stat.pass, fail: stat.fail, rate: total > 0 ? (stat.pass / total) * 100 : null,
    });
  }

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ days: String(days), sort, dir, ...over });
    return `/quality?${p.toString()}`;
  };

  return (
    <div className="max-w-[1500px] space-y-4">
      <header className="b-card !p-5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="b-icon b-icon-dark !size-11 shrink-0">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <div className="b-eyebrow">ניהול איכות</div>
            <h1 className="text-[26px] font-black tracking-tight text-bingo-black leading-none">לוח האיכות</h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">
              איך הצוות מדבר עם הלקוחות - {days} הימים האחרונים
            </p>
          </div>
          <div className="mr-auto flex items-center gap-2">
            <div className="b-segment">
              {PERIODS.map((p) => (
                <Link
                  key={p}
                  href={qs({ days: String(p) })}
                  className={`px-4 py-[7px] rounded-full text-[13px] font-semibold transition ${p === days ? "bg-white text-bingo-black shadow-sm" : "text-bingo-gray-500 hover:text-bingo-black"}`}
                >
                  {p} ימים
                </Link>
              ))}
            </div>
            <Link href="/calls" className="b-pill b-pill-ghost b-pill-sm">
              תור השיחות <ChevronLeft className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===== KPI ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi tint="b-tint-sky" icon={<PhoneCall className="size-4" />} label="שיחות שנותחו" value={rows.length.toLocaleString("he-IL")} />
        <Kpi
          tint="b-tint-mint"
          icon={<Gauge className="size-4" />}
          label="ציון ממוצע"
          value={avgScore !== null ? Math.round(avgScore).toString() : "-"}
          note={trend !== null ? `${trend >= 0 ? "+" : ""}${trend.toFixed(1)} מול התקופה הקודמת` : undefined}
          trendUp={trend !== null ? trend >= 0 : undefined}
        />
        <Kpi tint="b-tint-lilac" icon={<ShieldCheck className="size-4" />} label="עמידה בכללים" value={complianceRate !== null ? `${Math.round(complianceRate)}%` : "-"} />
        <Kpi tint="b-tint-rose" icon={<AlertTriangle className="size-4" />} label="חריגות קריטיות פתוחות" value={criticalOpen.toLocaleString("he-IL")} href="/calls?flagged=1" />
        <Kpi tint="b-tint-sand" icon={<Timer className="size-4" />} label="דקות דיבור" value={talkMinutes.toLocaleString("he-IL")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ===== נציגים ===== */}
        <section className="lg:col-span-7 b-card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-bingo-gray-100 flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-bingo-black">טבלת נציגים</h2>
            <span className="text-[11px] text-bingo-gray-400 mr-auto">מיון:</span>
            <SortLink href={qs({ sort: "score", dir: sort === "score" && dir === "desc" ? "asc" : "desc" })} active={sort === "score"}>ציון</SortLink>
            <SortLink href={qs({ sort: "violations", dir: sort === "violations" && dir === "desc" ? "asc" : "desc" })} active={sort === "violations"}>חריגות</SortLink>
            <SortLink href={qs({ sort: "calls", dir: sort === "calls" && dir === "desc" ? "asc" : "desc" })} active={sort === "calls"}>שיחות</SortLink>
          </div>
          {agentRows.length === 0 ? (
            <EmptyBlock text="עוד לא נותחו שיחות בתקופה הזו" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-bingo-gray-150 bg-bingo-gray-50">
                    <Th>נציג</Th>
                    <Th>שיחות</Th>
                    <Th>ציון ממוצע</Th>
                    <Th>עמידה בכללים</Th>
                    <Th>חריגות</Th>
                    <Th>נושא אימון מוביל</Th>
                  </tr>
                </thead>
                <tbody>
                  {agentRows.map((a) => {
                    const band = scoreBand(a.avg !== null ? Math.round(a.avg) : null);
                    return (
                      <tr key={a.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.04] transition">
                        <Td>
                          <Link href={a.id ? `/calls?agent=${a.id}` : "/calls"} className="text-[13px] font-bold text-bingo-black hover:text-bingo-green-dark transition">
                            {a.emoji ? `${a.emoji} ` : ""}{a.name}
                          </Link>
                        </Td>
                        <Td><span className="text-[12px] tabular-nums text-bingo-charcoal">{a.calls}</span></Td>
                        <Td>
                          <div className="flex items-center gap-2 min-w-32">
                            <div className="b-progress flex-1">
                              <div style={{ width: `${a.avg ?? 0}%`, background: SCORE_BAR[band] }} />
                            </div>
                            <span className="text-[12px] font-bold tabular-nums text-bingo-black w-7">
                              {a.avg !== null ? Math.round(a.avg) : "-"}
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <span className="text-[12px] tabular-nums text-bingo-charcoal">
                            {a.passRate !== null ? `${Math.round(a.passRate)}%` : "-"}
                          </span>
                        </Td>
                        <Td>
                          {a.violations > 0 ? (
                            <Link href={`/calls?flagged=1&agent=${a.id}`} className="b-chip b-chip-red tabular-nums">{a.violations}</Link>
                          ) : (
                            <span className="text-[12px] text-bingo-gray-400">0</span>
                          )}
                        </Td>
                        <Td>
                          <span className="text-[12px] text-bingo-gray-600 truncate max-w-48 inline-block align-middle">
                            {a.topTheme ?? "-"}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===== כללים ===== */}
        <section className="lg:col-span-5 b-card !p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[15px] font-bold text-bingo-black">עמידה לפי כלל</h2>
            <Link href="/settings/ai" className="text-[11px] font-bold text-bingo-green-dark hover:underline mr-auto">
              ניהול הכללים
            </Link>
          </div>
          {ruleView.length === 0 ? (
            <EmptyBlock text="עוד לא הוגדרו כללי בקרה" />
          ) : (
            <div className="space-y-2.5">
              {ruleView.map((r, i) => (
                <Link
                  key={`${r.id}-${i}`}
                  href={r.fail > 0 ? "/calls?flagged=1" : "/calls"}
                  className="block rounded-2xl border border-bingo-gray-100 px-3 py-2.5 hover:border-bingo-green/40 transition"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold text-bingo-black">{r.name}</span>
                    <span className={`b-chip ${SEVERITY_CHIP[r.severity] ?? "b-chip-gray"} !text-[10px]`}>
                      {SEVERITY_LABEL[r.severity] ?? r.severity}
                    </span>
                    {!r.active && <span className="b-chip b-chip-gray !text-[10px]">כבוי</span>}
                    <span className="text-[12px] font-bold tabular-nums text-bingo-black mr-auto">
                      {r.rate !== null ? `${Math.round(r.rate)}%` : "-"}
                    </span>
                  </div>
                  <div className="b-progress mt-2">
                    <div
                      style={{
                        width: `${r.rate ?? 0}%`,
                        background: r.rate === null ? "var(--color-bingo-gray-300)" : r.rate >= 90 ? "var(--color-bingo-green)" : r.rate >= 70 ? "var(--color-status-orange)" : "var(--color-status-red)",
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-bingo-gray-500 mt-1 tabular-nums">
                    {r.fail > 0 ? `${r.fail} כשלים מתוך ${r.pass + r.fail} בדיקות` : r.pass > 0 ? `${r.pass} בדיקות, אפס כשלים` : "לא נבדק בתקופה הזו"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===== מגמת ציון ===== */}
      <section className="b-card !p-4">
        <h2 className="text-[15px] font-bold text-bingo-black mb-3">מגמת ציון</h2>
        {scores.length === 0 ? (
          <EmptyBlock text="אין ציונים בתקופה הזו" />
        ) : (
          <div className="flex items-end gap-[3px] h-32" dir="ltr">
            {trendDays.map((d) => {
              const band = scoreBand(d.avg !== null ? Math.round(d.avg) : null);
              return (
                <div key={d.key} className="flex-1 min-w-[2px] h-full flex items-end" title={`${d.key}: ${d.avg !== null ? Math.round(d.avg) : "אין נתונים"}`}>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: d.avg !== null ? `${Math.max(4, d.avg)}%` : "3%",
                      background: d.avg !== null ? SCORE_BAR[band] : "var(--color-bingo-gray-150)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-bingo-gray-400 mt-1.5" dir="ltr">
          <span>{trendDays[0]?.key}</span>
          <span>{trendDays[trendDays.length - 1]?.key}</span>
        </div>
      </section>

      {/* ===== התראות ===== */}
      <section id="alerts" className="b-card !p-0 overflow-hidden scroll-mt-20">
        <div className="px-4 py-3 border-b border-bingo-gray-100">
          <h2 className="text-[15px] font-bold text-bingo-black">חריגות אחרונות</h2>
        </div>
        {alerts.length === 0 ? (
          <EmptyBlock text="אין התראות - הצוות נקי" />
        ) : (
          <div>
            {alerts.map((a) => (
              <Link
                key={a.id}
                href={a.callId ? `/calls/${a.callId}` : "/calls"}
                className="flex items-start gap-2.5 px-4 py-3 border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-gray-50 transition"
              >
                <span className={`size-2.5 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[a.severity] ?? "bg-bingo-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-bingo-black">{a.title}</div>
                  {a.body && <div className="text-[12px] text-bingo-gray-600 mt-0.5 line-clamp-2">{a.body}</div>}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-bingo-gray-400">
                    <span>{a.agent?.name ?? "ללא נציג"}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{relativeTime(a.createdAt)}</span>
                    {a.resolvedAt && <span className="b-chip b-chip-green !text-[10px]">טופל</span>}
                  </div>
                </div>
                <span className={`b-chip ${SCORE_CHIP[scoreBand(null)]} shrink-0`}>
                  {SEVERITY_LABEL[a.severity] ?? a.severity}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ tint, icon, label, value, note, trendUp, href }: {
  tint: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
  trendUp?: boolean;
  href?: string;
}) {
  const body = (
    <div className={`${tint} rounded-[20px] px-4 py-3.5 h-full`}>
      <span className="size-8 rounded-xl bg-white/70 inline-flex items-center justify-center text-bingo-black">{icon}</span>
      <div className="text-[26px] font-black tabular-nums leading-none text-bingo-black mt-2">{value}</div>
      <div className="text-[11px] font-bold text-bingo-black/60 mt-1">{label}</div>
      {note && (
        <div className="text-[10px] font-bold text-bingo-black/70 mt-1 inline-flex items-center gap-1">
          {trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {note}
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} className="b-lift block">{body}</Link> : body;
}

function SortLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-[11px] font-bold rounded-full px-2.5 py-1 transition ${active ? "bg-bingo-black text-white" : "text-bingo-gray-500 hover:bg-bingo-gray-100"}`}
    >
      {children}
    </Link>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return <div className="py-10 text-center text-[13px] text-bingo-gray-500">{text}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 text-[10px] font-bold text-bingo-gray-500 whitespace-nowrap">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2.5 align-middle whitespace-nowrap">{children}</td>;
}
