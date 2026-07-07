// מסך הלידים הראשי — שכפול Main.aspx של Yoatsim 1:1 בעיצוב בינגו.
// עץ תהליכים (ימין) · כפתורי פעולה · חיפוש · טאבים · טבלת 100 שורות.
// ?view=bingo → התצוגה הישנה של בינגו (קנבן/רשימה) נשמרת כפתח מילוט.
import Link from "next/link";
import { db } from "@/lib/db";
import { PROCESSES, processByKey } from "@/lib/yoatsim/processes";
import { formatNumber } from "@/lib/utils";
import { ActionButtons } from "@/components/yoatsim-main/ActionButtons";
import { SearchRow } from "@/components/yoatsim-main/SearchRow";
import { ProcessTree } from "@/components/yoatsim-main/ProcessTree";
import { LeadsTable, type LeadRow } from "@/components/yoatsim-main/LeadsTable";
// --- התצוגה הישנה (?view=bingo) ---
import { LeadsViewSwitcher } from "@/components/leads/LeadsViewSwitcher";
import { Sidebar } from "@/components/layout/Sidebar";
import { getPipeline } from "@/lib/data/static";
import { Search, Plus, Users, ChevronRight, ChevronLeft, Copy, FlaskConical, Contact, X, Archive as ArchiveIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100; // ברירת המחדל של Yoatsim

const TABS = [
  { key: "cards", label: "כרטיסים" },
  { key: "duplicates", label: "שכפול" },
  { key: "test-cards", label: "כרטיסים בדיקה" },
  { key: "contacts", label: "אנשי קשר" },
] as const;

/** טאב → Lead.cardKind */
const KIND_BY_TAB: Record<string, string> = {
  cards: "card",
  duplicates: "duplicate",
  "test-cards": "test",
};

interface PageProps {
  searchParams: Promise<{
    view?: string; p?: string; s?: string; // legacy
    q?: string; owner?: string; process?: string; status?: string; stage?: string;
    tab?: string; page?: string; archived?: string;
  }>;
}

/** בניית query string תוך שמירת הפילטרים הפעילים */
function qs(params: Record<string, string | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) u.set(k, v);
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  /* ================= פתח מילוט: התצוגה הישנה ================= */
  if (sp.view === "bingo") {
    const pipe = sp.p ? getPipeline(sp.p) : undefined;
    return (
      <div className="flex gap-5 -m-4 sm:-m-6">
        <Sidebar />
        <div className="flex-1 min-w-0 space-y-4 py-4 sm:py-6 pl-4 sm:pl-6">
          <div className="b-card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <span className="b-icon b-icon-green size-14">
                <Users className="size-6" />
              </span>
              <div className="min-w-0">
                <h1 className="text-[26px] font-bold tracking-tight text-bingo-black leading-none flex items-center gap-2.5">
                  {pipe ? pipe.label : "כל הלידים"}
                  <span className="b-chip b-chip-green tabular-nums">{pipe ? formatNumber(pipe.count) : "הכל"}</span>
                </h1>
                <p className="text-[13px] text-bingo-gray-500 mt-1.5">
                  {pipe ? `${formatNumber(pipe.count)} לידים בתהליך זה` : "כל הלידים, התהליכים והמשימות — במקום אחד"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="b-pill b-pill-ghost b-pill-sm">
                <Search className="size-4" /> חיפוש מתקדם
              </button>
              <button className="b-pill b-pill-green b-pill-sm">
                <Plus className="size-4" strokeWidth={2.6} /> ליד חדש
              </button>
            </div>
          </div>
          <LeadsViewSwitcher pipeline={sp.p} status={sp.s} />
        </div>
      </div>
    );
  }

  /* ================= השכפול: המסך הראשי של Yoatsim ================= */
  const q = (sp.q ?? "").trim();
  const qDigits = q.replace(/\D/g, "");
  const ownerId = sp.owner && Number.isInteger(Number(sp.owner)) ? Number(sp.owner) : undefined;
  const processKey = sp.process && processByKey(sp.process) ? sp.process : undefined;
  const status = processKey ? (sp.status ?? "").trim() || undefined : undefined;
  const stage = (sp.stage ?? "").trim() || undefined;
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "cards";
  const page = Math.max(1, Number(sp.page) || 1);
  const archivedView = sp.archived === "1";

  // הפילטרים המשותפים — בלי cardKind (משמש גם לספירת הטאבים)
  const whereBase: Record<string, unknown> = { archived: archivedView };
  if (q) {
    whereBase.OR = [
      { fullName: { contains: q } },
      { phone: { contains: qDigits || q } },
      { idNumber: { contains: qDigits || q } },
    ];
  }
  if (ownerId) whereBase.ownerId = ownerId;
  if (stage) whereBase.stage = stage;
  if (processKey) {
    whereBase.processes = { some: { processKey, ...(status ? { statusKey: status } : {}) } };
  }
  // הרשימה עצמה — לפי הטאב: כרטיסים / שכפול / כרטיסים בדיקה
  const where: Record<string, unknown> = { ...whereBase, cardKind: KIND_BY_TAB[tab] ?? "card" };

  const [
    overdueCount,
    newLeadsCount,
    totalAll,
    processGroups,
    statusGroups,
    users,
    kindGroups,
    leads,
  ] = await Promise.all([
    db.task.count({ where: { done: false, dueAt: { lt: new Date() } } }),
    db.lead.count({ where: { stage: "NEW", cardKind: "card", archived: false } }),
    db.lead.count({ where: { cardKind: "card", archived: false } }),
    db.leadProcess.groupBy({ by: ["processKey"], _count: { _all: true } }),
    processKey
      ? db.leadProcess.groupBy({ by: ["statusKey"], where: { processKey }, _count: { _all: true } })
      : Promise.resolve([] as { statusKey: string; _count: { _all: number } }[]),
    db.user.findMany({
      where: { active: true },
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
    // ספירות הטאבים — לפי cardKind, עם אותם פילטרים
    db.lead.groupBy({ by: ["cardKind"], where: whereBase, _count: { _all: true } }),
    tab !== "contacts"
      ? db.lead.findMany({
          where,
          include: {
            owner: { select: { name: true, emoji: true } },
            processes: { select: { id: true, processKey: true, statusKey: true }, orderBy: { createdAt: "asc" } },
          },
          orderBy: { intakeDate: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        })
      : Promise.resolve([]),
  ]);

  const processCounts: Record<string, number> = Object.fromEntries(
    processGroups.map((g) => [g.processKey, g._count._all]),
  );
  const statusCounts: Record<string, number> = Object.fromEntries(
    statusGroups.map((g) => [g.statusKey, g._count._all]),
  );
  const kindCounts: Record<string, number> = Object.fromEntries(
    kindGroups.map((g) => [g.cardKind, g._count._all]),
  );
  const tabCount = (tabKey: string): number =>
    tabKey === "contacts" ? 0 : kindCounts[KIND_BY_TAB[tabKey] ?? "card"] ?? 0;
  const total = tabCount(tab);

  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    fullName: l.fullName,
    idNumber: l.idNumber,
    source: l.sourceText || l.source,
    ownerName: l.owner?.name ?? null,
    ownerEmoji: l.owner?.emoji ?? null,
    stage: l.stage,
    intakeDate: l.intakeDate.toISOString(),
    processes: l.processes,
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const baseParams = {
    q: q || undefined, owner: sp.owner, process: processKey, status, stage,
    tab: tab !== "cards" ? tab : undefined,
    archived: archivedView ? "1" : undefined,
  };
  const selectedProcessDef = processKey ? processByKey(processKey) : undefined;
  const hasFilters = Boolean(q || ownerId || processKey || status || stage || archivedView);

  return (
    <div className="flex gap-4 items-start">
      {/* עץ התהליכים — בעברית RTL יושב בצד ימין */}
      <ProcessTree
        total={totalAll}
        counts={processCounts}
        statusCounts={statusCounts}
        selectedProcess={processKey}
        selectedStatus={status}
      />

      <div className="flex-1 min-w-0 space-y-3.5">
        {/* כפתורי הפעולה העליונים */}
        <ActionButtons overdueCount={overdueCount} newLeadsCount={newLeadsCount} />

        {/* שורת החיפוש */}
        <SearchRow users={users} q={q || undefined} owner={sp.owner} process={processKey} />

        {/* כותרת סינון פעיל + טאבים */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-[17px] font-bold text-bingo-black truncate">
              {selectedProcessDef ? (
                <>
                  {selectedProcessDef.emoji} {selectedProcessDef.name}
                  {status && <span className="text-bingo-gray-500 font-semibold"> · {status}</span>}
                </>
              ) : stage === "NEW" ? (
                "🆕 לידים חדשים"
              ) : q ? (
                <>תוצאות חיפוש: „{q}”</>
              ) : (
                "כל הלידים"
              )}
            </h1>
            <span className="b-chip b-chip-green tabular-nums">{formatNumber(total)}</span>
            {archivedView && (
              <span className="b-chip b-chip-dark text-[11px]">
                <ArchiveIcon className="size-3" /> ארכיון
              </span>
            )}
            {hasFilters && (
              <Link href="/leads" className="b-chip b-chip-gray text-[11px] hover:bg-bingo-gray-150 transition">
                <X className="size-3" /> נקה סינון
              </Link>
            )}
          </div>

          {/* טאבים — כרטיסים | שכפול | כרטיסים בדיקה | אנשי קשר + מתג ארכיון */}
          <div className="flex items-center gap-2">
            <div className="inline-flex gap-0.5 p-1 bg-bingo-gray-100 rounded-full">
              {TABS.map((t) => {
                const active = tab === t.key;
                const count = tabCount(t.key);
                return (
                  <Link
                    key={t.key}
                    href={`/leads${qs({ ...baseParams, tab: t.key === "cards" ? undefined : t.key })}`}
                    className={
                      active
                        ? "px-4 py-1.5 rounded-full text-[12.5px] font-bold bg-white text-bingo-black shadow-[0_2px_6px_rgba(41,41,41,0.10)]"
                        : "px-4 py-1.5 rounded-full text-[12.5px] font-semibold text-bingo-gray-500 hover:text-bingo-black transition"
                    }
                  >
                    {t.label}
                    {t.key !== "contacts" && (
                      <span className="mr-1.5 text-[10.5px] tabular-nums text-bingo-gray-400">{formatNumber(count)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
            {/* מתג ארכיון — מציג כרטיסים בארכיון (לפי הטאב הנוכחי) */}
            <Link
              href={`/leads${qs({ ...baseParams, archived: archivedView ? undefined : "1" })}`}
              className={
                archivedView
                  ? "b-chip b-chip-dark text-[11.5px] transition"
                  : "b-chip b-chip-gray text-[11.5px] hover:bg-bingo-gray-150 transition"
              }
              title={archivedView ? "חזרה לכרטיסים פעילים" : "הצג כרטיסים בארכיון"}
            >
              <ArchiveIcon className="size-3" /> ארכיון
            </Link>
          </div>
        </div>

        {/* התוכן לפי טאב */}
        {tab !== "contacts" && rows.length === 0 && !hasFilters && tab !== "cards" ? (
          <div className="b-card py-16 text-center">
            {tab === "duplicates" ? (
              <>
                <Copy className="size-8 text-bingo-gray-300 mx-auto mb-2.5" />
                <div className="text-[14px] font-semibold text-bingo-gray-500">אין כרטיסי שכפול</div>
              </>
            ) : (
              <>
                <FlaskConical className="size-8 text-bingo-gray-300 mx-auto mb-2.5" />
                <div className="text-[14px] font-semibold text-bingo-gray-500">אין כרטיסי בדיקה</div>
              </>
            )}
            <p className="text-[12px] text-bingo-gray-400 mt-1">יוצרים מכפתורי הפעולה בכותרת כרטיס הלקוח</p>
          </div>
        ) : tab !== "contacts" ? (
          <>
            <LeadsTable rows={rows} />

            {/* עימוד — 100 בעמוד כמו במקור */}
            {totalPages > 1 && (
              <div className="b-card px-4 py-2.5 flex items-center justify-between">
                {page > 1 ? (
                  <Link href={`/leads${qs({ ...baseParams, page: String(page - 1) })}`} className="b-pill b-pill-sm b-pill-ghost">
                    <ChevronRight className="size-4" /> הקודם
                  </Link>
                ) : (
                  <span className="b-pill b-pill-sm b-pill-ghost opacity-40 pointer-events-none">
                    <ChevronRight className="size-4" /> הקודם
                  </span>
                )}
                <span className="text-[12.5px] text-bingo-gray-500 tabular-nums">
                  עמוד <b className="text-bingo-black">{formatNumber(page)}</b> מתוך {formatNumber(totalPages)}
                  <span className="text-bingo-gray-300"> · </span>
                  {formatNumber(total)} לידים
                </span>
                {page < totalPages ? (
                  <Link href={`/leads${qs({ ...baseParams, page: String(page + 1) })}`} className="b-pill b-pill-sm b-pill-ghost">
                    הבא <ChevronLeft className="size-4" />
                  </Link>
                ) : (
                  <span className="b-pill b-pill-sm b-pill-ghost opacity-40 pointer-events-none">
                    הבא <ChevronLeft className="size-4" />
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="b-card py-16 text-center">
            <Contact className="size-8 text-bingo-gray-300 mx-auto mb-2.5" />
            <div className="text-[14px] font-semibold text-bingo-gray-500">אין אנשי קשר</div>
            <p className="text-[12px] text-bingo-gray-400 mt-1">אנשי קשר יתווספו בהמשך השכפול</p>
          </div>
        )}
      </div>
    </div>
  );
}
