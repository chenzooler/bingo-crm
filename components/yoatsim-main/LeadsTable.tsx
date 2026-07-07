"use client";
/**
 * טבלת הלידים — שכפול טבלת Main.aspx של Yoatsim:
 * # · שם פרטי + משפחה · תעודת זהות · מקור הליד · אחראי · סטטוס · קליטה.
 * שדה סינון קטן מתחת לכל כותרת (מסנן את העמוד הטעון), שורה = כניסה לכרטיס.
 * עמודת הסטטוס: כל תהליכי הליד כצ'יפים (ריבוי תהליכים — אותנטי למקור).
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { processByKey, PROCESS_EMOJI } from "@/lib/yoatsim/processes";
import { STAGES } from "@/lib/data/lifecycle";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export interface LeadRow {
  id: number;
  fullName: string;
  idNumber: string | null;
  source: string | null;
  ownerName: string | null;
  ownerEmoji: string | null;
  stage: string;
  intakeDate: string; // ISO
  processes: { id: number; processKey: string; statusKey: string }[];
}

const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
);

/* צבע צ'יפ לפי סמנטיקת הסטטוס — כמו הצבעוניות של המקור */
function chipTone(status: string): string {
  if (/שילם|קיבל|חתום|מאושרת|אישור/.test(status)) return "b-chip-green";
  if (/סורב|שלילי|ספאם|לא רלוונטי|לא מעוניין|נטש|אדום|חסום/.test(status)) return "b-chip-red";
  if (/ממתין|לחזור|אין מענה|בדיקת/.test(status)) return "b-chip-orange";
  return "b-chip-blue";
}

type Filters = {
  id: string; name: string; idn: string; source: string; owner: string; status: string; date: string;
};

const EMPTY_FILTERS: Filters = { id: "", name: "", idn: "", source: "", owner: "", status: "", date: "" };

export function LeadsTable({ rows }: { rows: LeadRow[] }) {
  const router = useRouter();
  const [f, setF] = React.useState<Filters>(EMPTY_FILTERS);
  const setFilter = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));

  const filtered = rows.filter((r) => {
    const stageLabel = STAGE_LABELS[r.stage] ?? r.stage;
    return (
      (!f.id || String(r.id).includes(f.id.trim())) &&
      (!f.name || r.fullName.includes(f.name.trim())) &&
      (!f.idn || (r.idNumber ?? "").includes(f.idn.trim())) &&
      (!f.source || (r.source ?? "").includes(f.source.trim())) &&
      (!f.owner || (r.ownerName ?? "").includes(f.owner.trim())) &&
      (!f.status ||
        r.processes.some((p) => p.statusKey.includes(f.status.trim()) || (processByKey(p.processKey)?.name ?? "").includes(f.status.trim())) ||
        (r.processes.length === 0 && stageLabel.includes(f.status.trim()))) &&
      (!f.date || formatDate(r.intakeDate).includes(f.date.trim()))
    );
  });

  const hasFilter = Object.values(f).some((v) => v.trim());

  return (
    <div className="b-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[820px]">
          <thead>
            <tr className="text-right">
              <Th className="w-20">#</Th>
              <Th>שם פרטי + משפחה</Th>
              <Th className="w-28">תעודת זהות</Th>
              <Th className="w-36">מקור הליד</Th>
              <Th className="w-32">אחראי</Th>
              <Th>סטטוס</Th>
              <Th className="w-28">קליטה</Th>
            </tr>
            <tr>
              <Tf value={f.id} onChange={setFilter("id")} />
              <Tf value={f.name} onChange={setFilter("name")} />
              <Tf value={f.idn} onChange={setFilter("idn")} />
              <Tf value={f.source} onChange={setFilter("source")} />
              <Tf value={f.owner} onChange={setFilter("owner")} />
              <Tf value={f.status} onChange={setFilter("status")} />
              <Tf value={f.date} onChange={setFilter("date")} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/leads/${r.id}`)}
                className="border-t border-bingo-gray-100 hover:bg-bingo-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2.5 tabular-nums text-bingo-gray-400 text-[12px]">{r.id}</td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/leads/${r.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-bingo-black hover:text-bingo-blue transition-colors"
                  >
                    {r.fullName}
                  </Link>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-bingo-gray-600">{r.idNumber ?? "—"}</td>
                <td className="px-3 py-2.5 text-bingo-gray-600 max-w-40 truncate">{r.source ?? "—"}</td>
                <td className="px-3 py-2.5 text-bingo-gray-600 whitespace-nowrap">
                  {r.ownerName ? (
                    <>
                      {r.ownerEmoji && <span className="ml-1">{r.ownerEmoji}</span>}
                      {r.ownerName}
                    </>
                  ) : (
                    <span className="text-bingo-gray-300">ללא</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {r.processes.length === 0 ? (
                      <span className="b-chip b-chip-gray text-[11px]">
                        {STAGE_LABELS[r.stage] ?? r.stage}
                      </span>
                    ) : (
                      r.processes.map((p) => (
                        <span key={p.id} className={cn("b-chip text-[11px]", chipTone(p.statusKey))} title={processByKey(p.processKey)?.name}>
                          <span>{PROCESS_EMOJI[p.processKey] ?? "•"}</span>
                          {p.statusKey}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-bingo-gray-600 whitespace-nowrap">
                  {formatDate(r.intakeDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-14 text-center">
          <Inbox className="size-8 text-bingo-gray-300 mx-auto mb-2" />
          <div className="text-[13px] font-medium text-bingo-gray-500">
            {rows.length === 0 ? "לא נמצאו לידים" : "אין תוצאות לסינון הנוכחי"}
          </div>
        </div>
      )}

      {hasFilter && filtered.length > 0 && (
        <div className="px-4 py-2 border-t border-bingo-gray-100 text-[11.5px] text-bingo-gray-400">
          מציג <b className="tabular-nums">{formatNumber(filtered.length)}</b> מתוך{" "}
          <b className="tabular-nums">{formatNumber(rows.length)}</b> בעמוד זה (סינון עמודות)
        </div>
      )}
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 pt-3 pb-1 text-right text-[11.5px] font-bold text-bingo-gray-500", className)}>
      {children}
    </th>
  );
}

function Tf({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <th className="px-2 pb-2.5">
      <input
        value={value}
        onChange={onChange}
        placeholder="סינון…"
        className="w-full h-7 rounded-lg border border-bingo-gray-150 bg-bingo-gray-50 px-2 text-[11.5px] font-normal text-bingo-black placeholder:text-bingo-gray-300 focus:outline-none focus:border-bingo-green-dark focus:bg-white transition-colors"
      />
    </th>
  );
}
