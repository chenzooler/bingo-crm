// חיפוש מתקדם — שכפול "חיפוש מתקדם" של Yoatsim על נתוני אמת.
// טופס GET → אותו עמוד בונה Prisma where בשרת; התוצאות באותה טבלת 7 עמודות
// של המסך הראשי (LeadsTable). טלפון/ת.ז מנוקים לספרות בלבד.
import Link from "next/link";
import { Search, SlidersHorizontal, X, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { processByKey } from "@/lib/yoatsim/processes";
import { formatNumber } from "@/lib/utils";
import { LeadsTable, type LeadRow } from "@/components/yoatsim-main/LeadsTable";
import { ProcessStatusSelect } from "./process-status-select";

export const dynamic = "force-dynamic";

const RESULTS_LIMIT = 100;

const CARD_KINDS = [
  { key: "card", label: "כרטיס" },
  { key: "duplicate", label: "שכפול" },
  { key: "test", label: "כרטיס בדיקה" },
] as const;

interface SearchQuery {
  name?: string; phone?: string; idn?: string; city?: string; source?: string;
  owner?: string; process?: string; status?: string; from?: string; to?: string;
  kind?: string; archived?: string; go?: string;
}

interface PageProps { searchParams: Promise<SearchQuery> }

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const submitted = sp.go === "1";

  /* ===== נירמול הפילטרים ===== */
  const name = (sp.name ?? "").trim();
  const phoneDigits = (sp.phone ?? "").replace(/\D/g, "");
  const idnDigits = (sp.idn ?? "").replace(/\D/g, "");
  const city = (sp.city ?? "").trim();
  const source = (sp.source ?? "").trim();
  const ownerId = sp.owner && Number.isInteger(Number(sp.owner)) ? Number(sp.owner) : undefined;
  const processKey = sp.process && processByKey(sp.process) ? sp.process : undefined;
  const status = processKey ? (sp.status ?? "").trim() || undefined : undefined;
  const from = (sp.from ?? "").trim();
  const to = (sp.to ?? "").trim();
  const kind = CARD_KINDS.some((k) => k.key === sp.kind) ? sp.kind : undefined;
  const includeArchived = sp.archived === "1";

  /* ===== בניית ה-where ===== */
  const where: Record<string, unknown> = {};
  if (name) where.fullName = { contains: name };
  if (phoneDigits) where.OR = [{ phone: { contains: phoneDigits } }, { phone2: { contains: phoneDigits } }];
  if (idnDigits) where.idNumber = { contains: idnDigits };
  if (city) where.city = { contains: city };
  if (source) where.source = source;
  if (ownerId) where.ownerId = ownerId;
  if (processKey) where.processes = { some: { processKey, ...(status ? { statusKey: status } : {}) } };
  if (from || to) {
    where.intakeDate = {
      ...(from ? { gte: new Date(from) } : {}),
      // "עד" כולל את היום עצמו — עד חצות של היום שאחריו
      ...(to ? { lt: new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000) } : {}),
    };
  }
  if (kind) where.cardKind = kind;
  if (!includeArchived) where.archived = false;

  /* ===== שליפות ===== */
  const [users, sourceRows] = await Promise.all([
    db.user.findMany({ where: { active: true }, select: { id: true, name: true, emoji: true }, orderBy: { name: "asc" } }),
    db.lead.findMany({ where: { source: { not: null } }, distinct: ["source"], select: { source: true }, orderBy: { source: "asc" } }),
  ]);
  const sources = sourceRows.map((r) => r.source).filter((s): s is string => !!s);

  const [total, leads] = submitted
    ? await Promise.all([
        db.lead.count({ where }),
        db.lead.findMany({
          where,
          include: {
            owner: { select: { name: true, emoji: true } },
            processes: { select: { id: true, processKey: true, statusKey: true }, orderBy: { createdAt: "asc" } },
          },
          orderBy: { intakeDate: "desc" },
          take: RESULTS_LIMIT,
        }),
      ])
    : [0, []];

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

  /* קישור "פתח ברשימת הלידים" — תרגום הפילטרים הנתמכים במסך הראשי */
  const leadsParams = new URLSearchParams();
  if (name) leadsParams.set("q", name);
  if (ownerId) leadsParams.set("owner", String(ownerId));
  if (processKey) leadsParams.set("process", processKey);
  if (status) leadsParams.set("status", status);
  const leadsHref = `/leads${leadsParams.size ? `?${leadsParams.toString()}` : ""}`;

  const selectedProcessDef = processKey ? processByKey(processKey) : undefined;

  return (
    <div className="space-y-4 max-w-[1200px]">
      {/* ===== כותרת ===== */}
      <div className="b-card p-5 flex items-center gap-4">
        <span className="b-icon b-icon-blue size-14">
          <SlidersHorizontal className="size-6" />
        </span>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-bingo-black leading-none">חיפוש מתקדם</h1>
          <p className="text-[13px] text-bingo-gray-500 mt-1.5">
            חיפוש בכל שדות הליד — שם, טלפון, ת.ז, עיר, מקור, תהליך וסטטוס, טווח קליטה וסוג כרטיס
          </p>
        </div>
      </div>

      {/* ===== טופס הפילטרים — GET לאותו עמוד ===== */}
      <form action="/search" method="get" className="b-card p-5">
        <input type="hidden" name="go" value="1" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">שם</span>
            <input name="name" defaultValue={sp.name ?? ""} placeholder="שם מלא או חלקי…" className="b-input h-10 text-[13px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">טלפון</span>
            <input name="phone" defaultValue={sp.phone ?? ""} inputMode="tel" placeholder="05X-XXXXXXX" className="b-input h-10 text-[13px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">תעודת זהות</span>
            <input name="idn" defaultValue={sp.idn ?? ""} inputMode="numeric" placeholder="9 ספרות" className="b-input h-10 text-[13px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">עיר</span>
            <input name="city" defaultValue={sp.city ?? ""} placeholder="שם עיר…" className="b-input h-10 text-[13px]" />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">מקור</span>
            <select name="source" defaultValue={sp.source ?? ""} className="b-input h-10 text-[13px] cursor-pointer">
              <option value="">כל המקורות</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">אחראי</span>
            <select name="owner" defaultValue={sp.owner ?? ""} className="b-input h-10 text-[13px] cursor-pointer">
              <option value="">כל המשתמשים</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.emoji ? `${u.emoji} ` : ""}{u.name}</option>
              ))}
            </select>
          </label>

          {/* תהליך + סטטוס תלוי (client) */}
          <ProcessStatusSelect process={processKey} status={status} />

          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">קליטה מ־</span>
            <input type="date" name="from" defaultValue={sp.from ?? ""} className="b-input h-10 text-[13px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">קליטה עד</span>
            <input type="date" name="to" defaultValue={sp.to ?? ""} className="b-input h-10 text-[13px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">סוג כרטיס</span>
            <select name="kind" defaultValue={kind ?? ""} className="b-input h-10 text-[13px] cursor-pointer">
              <option value="">כל הסוגים</option>
              {CARD_KINDS.map((k) => (
                <option key={k.key} value={k.key}>{k.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-end pb-2.5 gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="archived"
              value="1"
              defaultChecked={includeArchived}
              className="size-4 accent-[#292929] cursor-pointer"
            />
            <span className="text-[13px] font-semibold text-bingo-gray-600">כולל ארכיון</span>
          </label>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-bingo-gray-100">
          <button type="submit" className="b-pill b-pill-sm b-pill-dark">
            <Search className="size-4" /> הפעל חיפוש
          </button>
          <Link href="/search" className="b-pill b-pill-sm b-pill-ghost">
            <X className="size-4" /> נקה הכל
          </Link>
        </div>
      </form>

      {/* ===== תוצאות ===== */}
      {!submitted ? (
        <div className="b-card py-20 text-center">
          <Search className="size-9 text-bingo-gray-300 mx-auto mb-3" />
          <div className="text-[15px] font-semibold text-bingo-gray-500">בחר מסננים והפעל חיפוש</div>
          <p className="text-[12.5px] text-bingo-gray-400 mt-1">התוצאות יוצגו כאן באותה טבלה של מסך הלידים</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[16px] font-bold text-bingo-black">תוצאות חיפוש</h2>
            <span className="b-chip b-chip-green tabular-nums">{formatNumber(total)}</span>
            {selectedProcessDef && (
              <span className="b-chip b-chip-blue text-[11px]">
                {selectedProcessDef.emoji} {selectedProcessDef.name}
                {status ? ` · ${status}` : ""}
              </span>
            )}
            {total > RESULTS_LIMIT && (
              <span className="text-[12px] text-bingo-gray-400">מציג {RESULTS_LIMIT} ראשונים</span>
            )}
            <Link href={leadsHref} className="b-chip b-chip-gray text-[11px] hover:bg-bingo-gray-150 transition mr-auto">
              <ExternalLink className="size-3" /> פתח ברשימת הלידים
            </Link>
          </div>
          <LeadsTable rows={rows} />
        </>
      )}
    </div>
  );
}
