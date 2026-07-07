"use client";
/**
 * קבלת לידים / API — הגדרת הקליטה (AppSetting "lead-intake") + תיעוד ה-endpoint האמיתי
 * POST /api/intake. שכפול Yoatsim §2. שמירה אוטומטית על כל שינוי.
 */
import * as React from "react";
import Link from "next/link";
import { KeyRound, RefreshCw, Webhook } from "lucide-react";
import { PROCESSES, processByKey } from "@/lib/yoatsim/processes";
import type { LeadIntakeConfig } from "@/lib/yoatsim/app-defaults";
import { AppToggle, SaveBadge, CopyButton, useAppSettingSaver } from "./AppSettingControls";

const PROD_URL = "https://crm.bingoisrael.co.il/api/intake";

const KEY_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function randomApiKey(len = 24): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => KEY_ALPHABET[b % KEY_ALPHABET.length]).join("");
}

const FIELDS: { name: string; type: string; required: boolean; desc: string }[] = [
  { name: "fullName", type: "string", required: true, desc: "שם מלא של הלקוח" },
  { name: "phone", type: "string", required: false, desc: "טלפון (05XXXXXXXX)" },
  { name: "email", type: "string", required: false, desc: "אימייל" },
  { name: "source", type: "string", required: false, desc: "ערוץ המקור (facebook / landing-page / wati...)" },
  { name: "sourceText", type: "string", required: false, desc: "פירוט המקור — שם דף הנחיתה (למשל \"בינגו-פייסבוק כל מטרה\")" },
  { name: "amountRequested", type: "number", required: false, desc: "סכום הלוואה מבוקש ב-₪" },
  { name: "loanPurpose", type: "string", required: false, desc: "מטרת ההלוואה" },
];

export default function LeadsApiManager({ initial }: { initial: LeadIntakeConfig }) {
  const { value: config, save, state } = useAppSettingSaver<LeadIntakeConfig>("lead-intake", initial);

  const proc = processByKey(config.defaultProcess) ?? PROCESSES[0];

  const setProcess = (processKey: string) => {
    const p = processByKey(processKey) ?? PROCESSES[0];
    const statusKey = p.statuses.includes(config.defaultStatus) ? config.defaultStatus : p.statuses[0];
    void save({ ...config, defaultProcess: p.key, defaultStatus: statusKey });
  };

  const regenerate = () => {
    if (!window.confirm("להחליף את מפתח ה-API? דפי נחיתה שמשתמשים במפתח הישן יפסיקו לעבוד עד עדכון.")) return;
    void save({ ...config, apiKey: randomApiKey() });
  };

  const curl = [
    `curl -X POST ${PROD_URL} \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -H "x-api-key: ${config.apiKey}" \\`,
    `  -d '{"fullName":"ישראל ישראלי","phone":"0501234567","source":"landing-page","sourceText":"בינגו-פייסבוק כל מטרה","amountRequested":80000,"loanPurpose":"כל מטרה"}'`,
  ].join("\n");

  return (
    <div className="space-y-4">
      {/* כותרת */}
      <div className="b-card p-5">
        <div className="b-eyebrow">זרימת עבודה</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          קבלת לידים / API
          <span className="b-chip b-chip-green">שכפול Yoatsim §2</span>
          <SaveBadge state={state} />
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          נקודת הקליטה האחת של המערכת — <Link href="/settings/landing-pages" className="font-bold text-bingo-blue hover:underline">דפי הנחיתה</Link> והאינטגרציות
          דוחפים לידים לכאן. כל ליד נכנס נוצר עם תהליך+סטטוס ברירת המחדל ופעילות &quot;ליד התקבל מ-API&quot;.
        </p>
      </div>

      {/* הגדרות הקליטה */}
      <div className="b-card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="b-icon b-icon-green !size-8"><KeyRound className="size-4" /></span>
          <h3 className="text-[15px] font-extrabold text-bingo-black">הגדרות קליטה</h3>
          <div className="mr-auto flex items-center gap-2">
            <span className="text-[12px] font-bold text-bingo-gray-500">קליטת לידים פעילה</span>
            <AppToggle checked={config.active} onChange={(next) => void save({ ...config, active: next })} />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">מפתח API (header: x-api-key)</label>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              dir="ltr"
              readOnly
              value={config.apiKey}
              className="b-input h-10 font-mono text-[13px] flex-1 min-w-60 bg-bingo-gray-50"
            />
            <CopyButton text={config.apiKey} label="העתק מפתח" />
            <button type="button" onClick={regenerate} className="b-pill b-pill-ghost b-pill-sm">
              <RefreshCw className="size-3.5" /> החלף מפתח
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">תהליך ברירת מחדל</label>
            <select
              className="b-input h-10 w-full text-[13px] cursor-pointer"
              value={proc.key}
              onChange={(e) => setProcess(e.target.value)}
            >
              {PROCESSES.map((p) => (
                <option key={p.key} value={p.key}>{p.emoji} {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">סטטוס ברירת מחדל</label>
            <select
              className="b-input h-10 w-full text-[13px] cursor-pointer"
              value={config.defaultStatus}
              onChange={(e) => void save({ ...config, defaultStatus: e.target.value })}
            >
              {proc.statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* תיעוד ה-API */}
      <div className="b-card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="b-icon b-icon-blue !size-8"><Webhook className="size-4" /></span>
          <h3 className="text-[15px] font-extrabold text-bingo-black">תיעוד ה-Endpoint</h3>
        </div>

        <div dir="ltr" className="flex items-center gap-2 flex-wrap font-mono text-[13px]">
          <span className="b-chip b-chip-dark">POST</span>
          <code className="rounded-lg bg-bingo-gray-50 border border-bingo-gray-150 px-3 py-1.5">{PROD_URL}</code>
          <CopyButton text={PROD_URL} label="Copy URL" />
        </div>

        <div>
          <div className="text-[12px] font-bold text-bingo-charcoal mb-1.5">Headers</div>
          <div dir="ltr" className="rounded-2xl border border-bingo-gray-150 overflow-hidden font-mono text-[12px]">
            <div className="px-3 py-2 border-b border-bingo-gray-100 bg-bingo-gray-50">Content-Type: application/json</div>
            <div className="px-3 py-2">x-api-key: {config.apiKey}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-[12px] font-bold text-bingo-charcoal">דוגמת cURL</div>
            <CopyButton text={curl} label="העתק פקודה" />
          </div>
          <pre dir="ltr" className="rounded-2xl bg-bingo-black text-white/90 p-4 text-[11.5px] leading-relaxed font-mono overflow-x-auto whitespace-pre">
            {curl}
          </pre>
        </div>

        <div>
          <div className="text-[12px] font-bold text-bingo-charcoal mb-1.5">שדות הבקשה</div>
          <div className="rounded-2xl border border-bingo-gray-150 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead className="bg-bingo-gray-50 text-bingo-gray-500">
                <tr>
                  <th className="text-right px-3 py-2 font-semibold">שדה</th>
                  <th className="text-right px-3 py-2 font-semibold">סוג</th>
                  <th className="text-right px-3 py-2 font-semibold">חובה</th>
                  <th className="text-right px-3 py-2 font-semibold">תיאור</th>
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((f) => (
                  <tr key={f.name} className="border-t border-bingo-gray-100">
                    <td className="px-3 py-2 font-mono font-bold text-bingo-black" dir="ltr">{f.name}</td>
                    <td className="px-3 py-2 font-mono text-bingo-gray-500" dir="ltr">{f.type}</td>
                    <td className="px-3 py-2">
                      {f.required
                        ? <span className="b-chip b-chip-orange text-[10.5px]">חובה</span>
                        : <span className="b-chip b-chip-gray text-[10.5px]">אופציונלי</span>}
                    </td>
                    <td className="px-3 py-2 text-bingo-gray-600">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[11.5px] text-bingo-gray-500 space-y-0.5">
          <p><b className="text-bingo-charcoal">תשובות:</b> <span dir="ltr" className="font-mono">201 {"{id}"}</span> — הליד נוצר · <span dir="ltr" className="font-mono">400</span> — חסר fullName / JSON שגוי · <span dir="ltr" className="font-mono">401</span> — מפתח שגוי · <span dir="ltr" className="font-mono">403</span> — הקליטה כבויה.</p>
        </div>
      </div>
    </div>
  );
}
