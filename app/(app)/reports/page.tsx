// תצוגת דוח — שכפול "תצוגת דוח" של Yoatsim (full-spec §4) על נתוני אמת.
// דוח תלוי-משתמש: ?user=ID מסנן את כל הסקשנים; ?process=key פותח פירוט סטטוסים.
// הכל אגרגציות Prisma חיות — אפס נתוני דמו.
import Link from "next/link";
import { BarChart3, ListChecks, AlarmClock, Check, ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PROCESSES, processByKey } from "@/lib/yoatsim/processes";
import { formatNumber } from "@/lib/utils";
import { ReportFilters } from "@/components/reports/ReportFilters";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ user?: string; process?: string }>;
}

/** בר התקדמות יחסי — ויזואליזציה קלה לכל טבלת ספירות */
function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="b-progress w-full min-w-16">
      <div style={{ width: `${value > 0 ? Math.max(2.5, pct) : 0}%` }} />
    </div>
  );
}

function SectionCard({ title, note, children }: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="b-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3.5">
        <h2 className="text-[15px] font-bold text-bingo-black">{title}</h2>
        {note && <span className="text-[11px] text-bingo-gray-400">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const uid = sp.user && Number.isInteger(Number(sp.user)) ? Number(sp.user) : undefined;
  const processKey = sp.process && processByKey(sp.process) ? sp.process : undefined;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const leadWhere = uid ? { ownerId: uid } : {};
  const lpWhere = uid ? { lead: { ownerId: uid } } : {};
  const taskWhere = uid ? { OR: [{ fromUserId: uid }, { toUserId: uid }] } : {};

  const [
    allUsers,
    totalLeads,
    procGroups,
    statusGroups,
    ownerGroups,
    sourceGroups,
    intakeRows,
    tasksOpen,
    tasksOverdue,
    tasksDone,
    tasksFromGroups,
    tasksToGroups,
  ] = await Promise.all([
    db.user.findMany({ select: { id: true, name: true, emoji: true, active: true }, orderBy: { name: "asc" } }),
    db.lead.count({ where: leadWhere }),
    db.leadProcess.groupBy({ by: ["processKey"], where: lpWhere, _count: { _all: true } }),
    db.leadProcess.groupBy({ by: ["processKey", "statusKey"], where: lpWhere, _count: { _all: true } }),
    db.lead.groupBy({ by: ["ownerId"], where: leadWhere, _count: { _all: true } }),
    db.lead.groupBy({ by: ["source"], where: leadWhere, _count: { _all: true } }),
    db.lead.findMany({ where: { ...leadWhere, intakeDate: { gte: sixMonthsAgo } }, select: { intakeDate: true } }),
    db.task.count({ where: { ...taskWhere, done: false } }),
    db.task.count({ where: { ...taskWhere, done: false, dueAt: { lt: now } } }),
    db.task.count({ where: { ...taskWhere, done: true } }),
    db.task.groupBy({ by: ["fromUserId"], _count: { _all: true } }),
    db.task.groupBy({ by: ["toUserId"], _count: { _all: true } }),
  ]);

  const userById = new Map(allUsers.map((u) => [u.id, u]));
  const selectedUser = uid ? userById.get(uid) : undefined;

  /* ===== לידים לפי תהליך ===== */
  const procCounts = new Map(procGroups.map((g) => [g.processKey, g._count._all]));
  const procRows = PROCESSES.map((p) => ({ ...p, count: procCounts.get(p.key) ?? 0 }));
  const procMax = Math.max(1, ...procRows.map((r) => r.count));
  const totalAssignments = procRows.reduce((s, r) => s + r.count, 0);

  /* ===== סטטוסים לפי תהליך (שאילתה אחת, קיבוץ ב-JS) ===== */
  const statusByProcess = new Map<string, { statusKey: string; count: number }[]>();
  for (const g of statusGroups) {
    const list = statusByProcess.get(g.processKey) ?? [];
    list.push({ statusKey: g.statusKey, count: g._count._all });
    statusByProcess.set(g.processKey, list);
  }
  for (const list of statusByProcess.values()) list.sort((a, b) => b.count - a.count);

  /* ===== סטטוסים של התהליך הנבחר — כולל סטטוסים מוגדרים עם 0 ===== */
  const selectedProcess = processKey ? processByKey(processKey) : undefined;
  const selectedStatusRows = selectedProcess
    ? (() => {
        const dbCounts = new Map((statusByProcess.get(selectedProcess.key) ?? []).map((s) => [s.statusKey, s.count]));
        const defined = selectedProcess.statuses.map((s) => ({ statusKey: s, count: dbCounts.get(s) ?? 0 }));
        const extra = [...dbCounts.keys()]
          .filter((k) => !selectedProcess.statuses.includes(k))
          .map((k) => ({ statusKey: k, count: dbCounts.get(k)! }));
        return [...defined, ...extra].sort((a, b) => b.count - a.count);
      })()
    : [];
  const selectedStatusMax = Math.max(1, ...selectedStatusRows.map((r) => r.count));

  /* ===== לפי אחראי ===== */
  const ownerRows = ownerGroups
    .map((g) => ({
      user: g.ownerId != null ? userById.get(g.ownerId) : undefined,
      ownerId: g.ownerId,
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count);
  const ownerMax = Math.max(1, ...ownerRows.map((r) => r.count));

  /* ===== לפי מקור ===== */
  const sourceRows = sourceGroups
    .map((g) => ({ source: g.source, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
  const sourceMax = Math.max(1, ...sourceRows.map((r) => r.count));

  /* ===== משפך קליטה — 6 חודשים אחרונים ===== */
  const monthKey = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const monthBuckets: { key: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    monthBuckets.push({ key: monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)), count: 0 });
  }
  const bucketByKey = new Map(monthBuckets.map((b) => [b.key, b]));
  for (const r of intakeRows) {
    const b = bucketByKey.get(monthKey(r.intakeDate));
    if (b) b.count += 1;
  }
  const monthMax = Math.max(1, ...monthBuckets.map((b) => b.count));

  /* ===== משימות — טבלה פר-משתמש (יצר / קיבל) ===== */
  const fromCounts = new Map<number, number>();
  for (const g of tasksFromGroups) if (g.fromUserId != null) fromCounts.set(g.fromUserId, g._count._all);
  const toCounts = new Map<number, number>();
  for (const g of tasksToGroups) if (g.toUserId != null) toCounts.set(g.toUserId, g._count._all);
  const taskUserRows = allUsers
    .filter((u) => (fromCounts.get(u.id) ?? 0) > 0 || (toCounts.get(u.id) ?? 0) > 0)
    .filter((u) => !uid || u.id === uid) // הפילטר מצטבר גם כאן
    .map((u) => ({ user: u, from: fromCounts.get(u.id) ?? 0, to: toCounts.get(u.id) ?? 0 }))
    .sort((a, b) => b.to + b.from - (a.to + a.from));

  const activeUsers = allUsers.filter((u) => u.active).map(({ id, name, emoji }) => ({ id, name, emoji }));

  return (
    <div className="space-y-4 max-w-[1200px]">
      {/* ===== כותרת + פילטרים ===== */}
      <div className="b-card p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <span className="b-icon b-icon-blue size-14">
              <BarChart3 className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold tracking-tight text-bingo-black leading-none flex items-center gap-2.5 flex-wrap">
                תצוגת דוח
                <span className="b-chip b-chip-green tabular-nums">{formatNumber(totalLeads)} לידים</span>
                {selectedUser && (
                  <span className="b-chip b-chip-blue">
                    {selectedUser.emoji ? `${selectedUser.emoji} ` : ""}{selectedUser.name}
                  </span>
                )}
              </h1>
              <p className="text-[12px] text-bingo-gray-400 mt-1.5">
                דוח תלוי-משתמש — כמו ביועצים; שיוך דוחות למשתמש ינוהל בניהול משתמשים
              </p>
            </div>
          </div>
          <ReportFilters users={activeUsers} user={sp.user} process={processKey} />
        </div>
      </div>

      {/* ===== לידים לפי תהליך — טבלת הכסף ===== */}
      <SectionCard title="לידים לפי תהליך" note={`${formatNumber(totalAssignments)} שיוכי תהליך · לחיצה על סטטוס פותחת את הרשימה`}>
        <div className="divide-y divide-bingo-gray-100">
          {procRows.map((p) => {
            const statuses = statusByProcess.get(p.key) ?? [];
            return (
              <details key={p.key} className="group">
                <summary className="flex items-center gap-3 py-2.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-bingo-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <ChevronLeft className="size-3.5 text-bingo-gray-300 transition-transform group-open:-rotate-90 shrink-0" />
                  <span className="text-[13px] font-semibold text-bingo-black w-56 shrink-0 truncate">
                    {p.emoji} {p.name}
                  </span>
                  <Bar value={p.count} max={procMax} />
                  <span className="tabular-nums text-[13px] font-bold text-bingo-black w-16 text-left shrink-0">
                    {formatNumber(p.count)}
                  </span>
                  <Link
                    href={`/leads?process=${p.key}`}
                    className="b-chip b-chip-gray text-[10.5px] shrink-0 hover:bg-bingo-gray-150 transition"
                  >
                    פתח ברשימה
                  </Link>
                </summary>
                <div className="pr-9 pb-2.5 space-y-1">
                  {statuses.length === 0 ? (
                    <div className="text-[12px] text-bingo-gray-400 py-1">אין לידים בתהליך זה</div>
                  ) : (
                    statuses.slice(0, 8).map((s) => (
                      <Link
                        key={s.statusKey}
                        href={`/leads?process=${p.key}&status=${encodeURIComponent(s.statusKey)}`}
                        className="flex items-center gap-3 py-1 rounded-lg hover:bg-bingo-gray-50 px-2 -mx-2 transition-colors"
                      >
                        <span className="text-[12px] text-bingo-gray-600 flex-1 min-w-0 truncate">{s.statusKey}</span>
                        <span className="tabular-nums text-[12px] font-semibold text-bingo-gray-700">{formatNumber(s.count)}</span>
                      </Link>
                    ))
                  )}
                  {statuses.length > 8 && (
                    <Link href={`/reports?${new URLSearchParams({ ...(sp.user ? { user: sp.user } : {}), process: p.key }).toString()}`} className="block text-[11.5px] text-bingo-blue hover:underline px-2">
                      כל {statuses.length} הסטטוסים ←
                    </Link>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </SectionCard>

      {/* ===== לידים לפי סטטוס — התהליך הנבחר ===== */}
      {selectedProcess && (
        <SectionCard
          title={`לידים לפי סטטוס — ${selectedProcess.emoji} ${selectedProcess.name}`}
          note={`${formatNumber(procCounts.get(selectedProcess.key) ?? 0)} לידים בתהליך`}
        >
          <div className="divide-y divide-bingo-gray-100">
            {selectedStatusRows.map((s) => (
              <Link
                key={s.statusKey}
                href={`/leads?process=${selectedProcess.key}&status=${encodeURIComponent(s.statusKey)}`}
                className="flex items-center gap-3 py-2 hover:bg-bingo-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <span className="text-[13px] text-bingo-black w-72 shrink-0 truncate">{s.statusKey}</span>
                <Bar value={s.count} max={selectedStatusMax} />
                <span className="tabular-nums text-[13px] font-bold w-14 text-left shrink-0">{formatNumber(s.count)}</span>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* ===== לפי אחראי ===== */}
        <SectionCard title="לפי אחראי" note={`${ownerRows.length} אחראים`}>
          <div className="divide-y divide-bingo-gray-100">
            {ownerRows.length === 0 && <div className="text-[12.5px] text-bingo-gray-400 py-2">אין לידים</div>}
            {ownerRows.map((r) => (
              <div key={r.ownerId ?? "none"} className="flex items-center gap-3 py-2">
                <span className="text-[13px] font-semibold text-bingo-black w-40 shrink-0 truncate">
                  {r.user ? (
                    <>{r.user.emoji ? `${r.user.emoji} ` : ""}{r.user.name}</>
                  ) : (
                    <span className="text-bingo-gray-400">ללא שיוך</span>
                  )}
                </span>
                <Bar value={r.count} max={ownerMax} />
                <span className="tabular-nums text-[13px] font-bold w-12 text-left shrink-0">{formatNumber(r.count)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ===== לפי מקור ===== */}
        <SectionCard title="לפי מקור" note={`${sourceRows.length} מקורות`}>
          <div className="divide-y divide-bingo-gray-100">
            {sourceRows.length === 0 && <div className="text-[12.5px] text-bingo-gray-400 py-2">אין לידים</div>}
            {sourceRows.map((r) => (
              <div key={r.source ?? "none"} className="flex items-center gap-3 py-2">
                <span className="text-[13px] font-semibold text-bingo-black w-40 shrink-0 truncate">
                  {r.source ?? <span className="text-bingo-gray-400">ללא מקור</span>}
                </span>
                <Bar value={r.count} max={sourceMax} />
                <span className="tabular-nums text-[13px] font-bold w-12 text-left shrink-0">{formatNumber(r.count)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ===== משפך קליטה ===== */}
        <SectionCard title="משפך קליטה" note="לידים חדשים לפי חודש · 6 חודשים אחרונים">
          <div className="space-y-2">
            {monthBuckets.map((b) => (
              <div key={b.key} className="flex items-center gap-3">
                <span className="tabular-nums text-[12.5px] font-semibold text-bingo-gray-600 w-16 shrink-0">{b.key}</span>
                <Bar value={b.count} max={monthMax} />
                <span className="tabular-nums text-[13px] font-bold w-12 text-left shrink-0">{formatNumber(b.count)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ===== משימות ===== */}
        <SectionCard title="משימות" note={uid ? "משימות שהמשתמש יצר או קיבל" : "כלל המערכת"}>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="b-chip b-chip-blue tabular-nums">
              <ListChecks className="size-3" /> {formatNumber(tasksOpen)} פתוחות
            </span>
            <span className="b-chip b-chip-red tabular-nums">
              <AlarmClock className="size-3" /> {formatNumber(tasksOverdue)} באיחור
            </span>
            <span className="b-chip b-chip-green tabular-nums">
              <Check className="size-3" /> {formatNumber(tasksDone)} הושלמו
            </span>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-right text-[11px] font-bold text-bingo-gray-500 border-b border-bingo-gray-100">
                <th className="py-1.5">משתמש</th>
                <th className="py-1.5 w-20">יצר ←</th>
                <th className="py-1.5 w-20">← קיבל</th>
              </tr>
            </thead>
            <tbody>
              {taskUserRows.length === 0 && (
                <tr><td colSpan={3} className="py-3 text-bingo-gray-400">אין משימות</td></tr>
              )}
              {taskUserRows.map((r) => (
                <tr key={r.user.id} className="border-b border-bingo-gray-50 last:border-0">
                  <td className="py-1.5 font-semibold text-bingo-black">
                    {r.user.emoji ? `${r.user.emoji} ` : ""}{r.user.name}
                  </td>
                  <td className="py-1.5 tabular-nums">{formatNumber(r.from)}</td>
                  <td className="py-1.5 tabular-nums">{formatNumber(r.to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}
