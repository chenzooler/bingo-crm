// תור בקרת האיכות - כל השיחות שהמנוע נגע בהן, עם סינון למנהל.
// ?flagged=1 · ?agent=ID · ?minScore= ?maxScore= · ?from= ?to= · ?status=aiStatus · ?page=
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { PhoneCall, ShieldAlert, Gauge, ChevronLeft, Search } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import {
  formatDuration, scoreBand, SCORE_CHIP, AI_STATUS_LABEL, AI_STATUS_CHIP, DISPOSITION_LABEL,
} from "@/components/manager/quality-utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function num(v: string): number | undefined {
  const n = Number(v);
  return v !== "" && Number.isFinite(n) ? n : undefined;
}

function day(v: string, endOfDay = false): Date | undefined {
  if (!v) return undefined;
  const d = new Date(endOfDay ? `${v}T23:59:59.999` : `${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function CallsQueuePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const flagged = one(sp.flagged) === "1";
  const agent = num(one(sp.agent));
  const minScore = num(one(sp.minScore));
  const maxScore = num(one(sp.maxScore));
  const from = day(one(sp.from));
  const to = day(one(sp.to), true);
  const status = one(sp.status);
  const page = Math.max(1, num(one(sp.page)) ?? 1);

  const where: Prisma.CallWhereInput = {};
  if (agent !== undefined) where.userId = agent;
  if (status) where.aiStatus = status;
  if (from || to) where.dialedAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

  const analysisFilter: Prisma.CallAnalysisWhereInput = {};
  if (flagged) analysisFilter.violationCount = { gt: 0 };
  if (minScore !== undefined || maxScore !== undefined) {
    analysisFilter.score = {
      ...(minScore !== undefined ? { gte: minScore } : {}),
      ...(maxScore !== undefined ? { lte: maxScore } : {}),
    };
  }
  if (Object.keys(analysisFilter).length > 0) where.analysis = { is: analysisFilter };

  const [calls, total, agents, analyzedCount, openAlerts, scoreAgg] = await Promise.all([
    db.call.findMany({
      where,
      orderBy: { dialedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        lead: { select: { id: true, fullName: true } },
        user: { select: { id: true, name: true, emoji: true } },
        analysis: { select: { score: true, violationCount: true } },
      },
    }),
    db.call.count({ where }),
    db.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.call.count({ where: { aiStatus: "done" } }),
    db.alert.count({ where: { resolvedAt: null } }),
    db.callAnalysis.aggregate({ _avg: { score: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const avgScore = scoreAgg._avg.score;

  return (
    <div className="max-w-[1500px] space-y-4">
      <header className="b-card !p-5">
        <div className="flex items-center gap-3.5">
          <span className="b-icon b-icon-dark !size-11 shrink-0">
            <PhoneCall className="size-5" />
          </span>
          <div>
            <div className="b-eyebrow">בקרת איכות</div>
            <h1 className="text-[26px] font-black tracking-tight text-bingo-black leading-none">תור השיחות</h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">
              כל שיחה שנותחה, עם הציון והחריגות - לחיצה על שורה פותחת את הסקירה המלאה
            </p>
          </div>
          <Link href="/quality" className="b-pill b-pill-ghost b-pill-sm mr-auto">
            לוח האיכות <ChevronLeft className="size-4" />
          </Link>
        </div>
      </header>

      {/* ===== רצועת מספרים ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile tint="b-tint-mint" label="שיחות נותחו" value={analyzedCount.toLocaleString("he-IL")} icon={<PhoneCall className="size-4" />} />
        <StatTile tint="b-tint-rose" label="חריגות פתוחות" value={openAlerts.toLocaleString("he-IL")} icon={<ShieldAlert className="size-4" />} href="/calls?flagged=1" />
        <StatTile tint="b-tint-sand" label="ציון ממוצע" value={avgScore !== null ? Math.round(avgScore).toString() : "-"} icon={<Gauge className="size-4" />} />
      </div>

      {/* ===== סינון ===== */}
      <form method="get" action="/calls" className="b-card !p-4">
        <div className="flex flex-wrap items-end gap-2.5">
          <Field label="נציג">
            <select name="agent" defaultValue={agent !== undefined ? String(agent) : ""} className="b-input !h-9 !text-[12px] min-w-40">
              <option value="">כל הנציגים</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field label="סטטוס ניתוח">
            <select name="status" defaultValue={status} className="b-input !h-9 !text-[12px] min-w-36">
              <option value="">הכל</option>
              {Object.entries(AI_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="ציון מ">
            <input type="number" name="minScore" min={0} max={100} defaultValue={minScore ?? ""} className="b-input !h-9 !w-20 !text-[12px] tabular-nums" />
          </Field>
          <Field label="עד">
            <input type="number" name="maxScore" min={0} max={100} defaultValue={maxScore ?? ""} className="b-input !h-9 !w-20 !text-[12px] tabular-nums" />
          </Field>
          <Field label="מתאריך">
            <input type="date" name="from" defaultValue={one(sp.from)} className="b-input !h-9 !text-[12px]" />
          </Field>
          <Field label="עד תאריך">
            <input type="date" name="to" defaultValue={one(sp.to)} className="b-input !h-9 !text-[12px]" />
          </Field>
          <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-bingo-gray-200 bg-white cursor-pointer">
            <input type="checkbox" name="flagged" value="1" defaultChecked={flagged} className="accent-bingo-green" />
            <span className="text-[12px] font-bold text-bingo-black">רק עם חריגות</span>
          </label>
          <button type="submit" className="b-pill b-pill-dark b-pill-sm">
            <Search className="size-4" /> סנן
          </button>
          <Link href="/calls" className="b-pill b-pill-ghost b-pill-sm">נקה</Link>
        </div>
      </form>

      {/* ===== טבלה ===== */}
      <section className="b-card !p-0 overflow-hidden">
        {calls.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[15px] font-bold text-bingo-black">אין שיחות שעונות על הסינון</div>
            <p className="text-[12px] text-bingo-gray-500 mt-1.5">
              {total === 0 && Object.keys(where).length === 0
                ? "ברגע שיבוצעו שיחות והמנוע ינתח אותן, הן יופיעו כאן"
                : "אפשר לנקות את הסינון ולראות את כל השיחות"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-bingo-gray-150 bg-bingo-gray-50">
                  <Th>תאריך ושעה</Th>
                  <Th>ליד</Th>
                  <Th>נציג</Th>
                  <Th>משך</Th>
                  <Th>ציון</Th>
                  <Th>חריגות</Th>
                  <Th>סיווג</Th>
                  <Th>ניתוח</Th>
                  <Th> </Th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => {
                  const band = scoreBand(c.analysis?.score);
                  return (
                    <tr key={c.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.04] transition">
                      <Td>
                        <Link href={`/calls/${c.id}`} className="block">
                          <span className="font-mono tabular-nums text-[12px] text-bingo-black">
                            {formatDate(c.dialedAt)} {formatTime(c.dialedAt)}
                          </span>
                        </Link>
                      </Td>
                      <Td>
                        {c.lead ? (
                          <Link href={`/leads/${c.lead.id}`} className="text-[13px] font-bold text-bingo-black hover:text-bingo-green-dark transition">
                            {c.lead.fullName || "ללא שם"}
                          </Link>
                        ) : (
                          <span className="text-[12px] text-bingo-gray-500 font-mono">{c.targetPhone || "-"}</span>
                        )}
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`} className="text-[12px] text-bingo-charcoal">
                          {c.user?.emoji ? `${c.user.emoji} ` : ""}{c.user?.name || "-"}
                        </Link>
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`} className="font-mono tabular-nums text-[12px] text-bingo-gray-600">
                          {formatDuration(c.duration)}
                        </Link>
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`}>
                          {c.analysis?.score !== null && c.analysis?.score !== undefined ? (
                            <span className={`b-chip ${SCORE_CHIP[band]} tabular-nums`}>{c.analysis.score}</span>
                          ) : (
                            <span className="text-[12px] text-bingo-gray-400">-</span>
                          )}
                        </Link>
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`}>
                          {(c.analysis?.violationCount ?? 0) > 0 ? (
                            <span className="b-chip b-chip-red tabular-nums">{c.analysis?.violationCount}</span>
                          ) : (
                            <span className="text-[12px] text-bingo-gray-400">0</span>
                          )}
                        </Link>
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`} className="text-[12px] text-bingo-charcoal">
                          {c.disposition ? DISPOSITION_LABEL[c.disposition] ?? c.disposition : "-"}
                        </Link>
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`}>
                          <span className={`b-chip ${AI_STATUS_CHIP[c.aiStatus] ?? "b-chip-gray"}`}>
                            {AI_STATUS_LABEL[c.aiStatus] ?? c.aiStatus}
                          </span>
                        </Link>
                      </Td>
                      <Td>
                        <Link href={`/calls/${c.id}`} className="text-bingo-gray-400 hover:text-bingo-black inline-flex" aria-label="פתח סקירה">
                          <ChevronLeft className="size-4" />
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-bingo-gray-100">
            <span className="text-[11px] text-bingo-gray-500 tabular-nums">
              עמוד {page} מתוך {pages} · {total.toLocaleString("he-IL")} שיחות
            </span>
            <div className="flex items-center gap-1.5">
              {page > 1 && (
                <Link href={pageHref(sp, page - 1)} className="b-pill b-pill-ghost b-pill-sm">הקודם</Link>
              )}
              {page < pages && (
                <Link href={pageHref(sp, page + 1)} className="b-pill b-pill-ghost b-pill-sm">הבא</Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function pageHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val) params.set(k, val);
  }
  params.set("page", String(page));
  return `/calls?${params.toString()}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-bingo-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 text-[10px] font-bold text-bingo-gray-500 whitespace-nowrap">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2.5 align-middle whitespace-nowrap">{children}</td>;
}

function StatTile({ tint, label, value, icon, href }: {
  tint: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const body = (
    <div className={`${tint} rounded-[20px] px-4 py-3.5 flex items-center gap-3 h-full`}>
      <span className="size-9 rounded-xl bg-white/70 inline-flex items-center justify-center text-bingo-black shrink-0">
        {icon}
      </span>
      <div>
        <div className="text-[24px] font-black tabular-nums leading-none text-bingo-black">{value}</div>
        <div className="text-[11px] font-bold text-bingo-black/60 mt-1">{label}</div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="b-lift block">{body}</Link> : body;
}
