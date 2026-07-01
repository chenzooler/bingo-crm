"use client";
import * as React from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft, Database, Sparkles, RefreshCw, X, ChevronLeft } from "lucide-react";
import { Icon3D } from "@/components/ui/Icon3D";
import { Confetti } from "@/components/ui/Confetti";
import { cn } from "@/lib/utils";

type Step = "upload" | "mapping" | "importing" | "done";

// Human labels for schema fields (mapping UI)
const FIELD_LABELS: Record<string, string> = {
  externalId: "מזהה Yoatsim",
  fullName: "שם מלא", firstName: "שם פרטי", lastName: "שם משפחה",
  idNumber: "תעודת זהות", phone: "טלפון", phone2: "טלפון נוסף", email: "אימייל",
  birthDate: "תאריך לידה", gender: "מין", maritalStatus: "מצב משפחתי",
  city: "עיר", address: "כתובת", zip: "מיקוד",
  employmentStatus: "תעסוקה", employerName: "מעסיק", monthlyIncome: "הכנסה חודשית",
  seniorityMonths: "ותק (חודשים)", spouseIncome: "הכנסת בן/בת זוג", numberOfChildren: "ילדים",
  bankName: "בנק", bankBranch: "סניף", bankAccount: "חשבון",
  amountRequested: "סכום מבוקש", loanPurpose: "מטרת הלוואה", monthlyObligations: "החזרים קיימים",
  statusLabel: "סטטוס (Yoatsim)", pipelineLabel: "תהליך", ownerName: "נציג מטפל",
  providerName: "ספק לידים", source: "מקור", intakeDate: "תאריך קליטה", notes: "הערות",
};

export default function ImportPage() {
  const [step, setStep] = React.useState<Step>("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<any>(null);
  const [mapping, setMapping] = React.useState<Record<string, string | null>>({});
  const [report, setReport] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [confetti, setConfetti] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setError(null);
    setFile(f);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/import/preview", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
      setMapping(data.mapping);
      setStep("mapping");
    } catch (e: any) {
      setError(e.message || "שגיאה בקריאת הקובץ");
    }
  }

  async function runImport() {
    if (!file) return;
    setStep("importing");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mapping", JSON.stringify(mapping));
    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data);
      setStep("done");
      setConfetti((c) => c + 1);
    } catch (e: any) {
      setError(e.message || "שגיאה בייבוא");
      setStep("mapping");
    }
  }

  function reset() {
    setStep("upload"); setFile(null); setPreview(null); setMapping({}); setReport(null); setError(null);
  }

  const mappedCount = Object.values(mapping).filter(Boolean).length;

  return (
    <div className="max-w-[1100px] space-y-4">
      <Confetti trigger={confetti} count={50} />

      {/* Hero */}
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<Database className="size-6" />} tone="bingo" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">סנכרון נתונים · Yoatsim → Bingo</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">ייבוא לידים</span>
              <span className="text-[12px] font-black px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">Excel / CSV</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">יצא קובץ מ-Yoatsim, גרור לכאן — המערכת מזהה עמודות, מנקה ומאמתת הכל אוטומטית</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <AlertTriangle className="size-5 text-red-600 shrink-0" />
          <span className="text-[13px] font-bold text-red-800 flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="size-4 text-red-400" /></button>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer transition-all",
            dragOver ? "border-bingo-green bg-bingo-green/5 scale-[1.01]" : "border-bingo-gray-300 bg-white hover:border-bingo-green/50 hover:bg-bingo-green/[0.02]"
          )}
        >
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <Icon3D icon={<Upload className="size-8" />} tone="bingo" size={80} className="mx-auto mb-4 float-rotate" />
          <h2 className="text-[22px] font-black text-bingo-black mb-1">גרור קובץ לכאן או לחץ לבחירה</h2>
          <p className="text-[13px] text-bingo-gray-500">Excel (.xlsx) או CSV — הייצוא מ-Yoatsim כמו שהוא, בלי לגעת</p>
          <div className="mt-6 inline-flex items-center gap-2 text-[11px] text-bingo-gray-400">
            <FileSpreadsheet className="size-3.5" />
            עברית נתמכת מלא · UTF-8 / Windows-1255
          </div>
        </div>
      )}

      {/* STEP 2: MAPPING */}
      {step === "mapping" && preview && (
        <>
          <div className="rounded-3xl bg-white border border-bingo-gray-200 p-5" style={{ boxShadow: "0 8px 24px -6px rgba(46,161,13,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon3D icon={<FileSpreadsheet className="size-5" />} tone="green" size={44} />
                <div>
                  <div className="text-[15px] font-black text-bingo-black">{preview.filename}</div>
                  <div className="text-[12px] text-bingo-gray-500">
                    <b className="text-gradient-bingo">{preview.totalRows.toLocaleString()}</b> שורות · זוהו <b>{mappedCount}</b> מתוך {preview.headers.length} עמודות
                  </div>
                </div>
              </div>
              <button onClick={reset} className="text-[12px] text-bingo-gray-500 hover:text-bingo-black font-bold">החלף קובץ</button>
            </div>

            {/* Column mapping table */}
            <div className="rounded-2xl border border-bingo-gray-150 overflow-hidden">
              <div className="grid grid-cols-12 bg-bingo-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">
                <div className="col-span-4">עמודה בקובץ</div>
                <div className="col-span-4">שדה במערכת</div>
                <div className="col-span-4">דוגמה מהקובץ</div>
              </div>
              <div className="divide-y divide-bingo-gray-100 max-h-[420px] overflow-y-auto">
                {preview.headers.map((h: string) => (
                  <div key={h} className="grid grid-cols-12 items-center px-4 py-2 hover:bg-bingo-gray-50/50">
                    <div className="col-span-4 text-[13px] font-bold text-bingo-black truncate">{h}</div>
                    <div className="col-span-4 pl-3">
                      <select
                        value={mapping[h] || ""}
                        onChange={(e) => setMapping({ ...mapping, [h]: e.target.value || null })}
                        className={cn(
                          "w-full h-8 rounded-lg border text-[12px] px-2 outline-none transition",
                          mapping[h] ? "border-bingo-green/40 bg-bingo-green/5 text-bingo-green-deep font-bold" : "border-bingo-gray-200 text-bingo-gray-400"
                        )}
                      >
                        <option value="">— דלג —</option>
                        {Object.entries(FIELD_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4 pl-3 text-[11px] text-bingo-gray-500 truncate tabular-nums">
                      {String(preview.sample?.[0]?.[h] ?? "")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-white border border-bingo-gray-200 p-4 sticky bottom-4" style={{ boxShadow: "0 8px 32px -8px rgba(0,0,0,0.12)" }}>
            <div className="text-[12px] text-bingo-gray-600">
              ✓ אימות ת.ז · ✓ נרמול טלפונים · ✓ זיהוי כפילויות · ✓ מיפוי 114 סטטוסים · ✓ ספקים נוצרים אוטומטית
            </div>
            <button onClick={runImport} className="btn-vibrant" style={{ fontSize: 14, padding: "12px 24px" }}>
              <Database className="size-4" />
              ייבא {preview.totalRows.toLocaleString()} לידים
            </button>
          </div>
        </>
      )}

      {/* STEP 3: IMPORTING */}
      {step === "importing" && (
        <div className="rounded-3xl bg-white border border-bingo-gray-200 p-16 text-center">
          <div className="size-20 mx-auto mb-4 rounded-full border-4 border-bingo-green border-t-transparent animate-spin" />
          <h2 className="text-[20px] font-black text-bingo-black">מייבא, מנקה ומאמת...</h2>
          <p className="text-[13px] text-bingo-gray-500 mt-1">בודק ת.ז, מנרמל טלפונים, מזהה כפילויות, ממפה סטטוסים</p>
        </div>
      )}

      {/* STEP 4: DONE */}
      {step === "done" && report && (
        <div className="rounded-3xl bg-white border-2 border-bingo-green/30 p-8" style={{ boxShadow: "0 8px 32px -8px rgba(80,255,10,0.25)" }}>
          <div className="text-center mb-6">
            <Icon3D icon={<CheckCircle2 className="size-8" />} tone="bingo" size={80} className="mx-auto mb-3" />
            <h2 className="text-[28px] font-black text-bingo-black">הסנכרון הושלם! 🎉</h2>
            <p className="text-[13px] text-bingo-gray-500 mt-1">הנתונים מ-Yoatsim עכשיו חיים ב-Bingo CRM</p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            <ReportStat label="סה״כ שורות" value={report.totalRows} tone="gray" />
            <ReportStat label="לידים חדשים" value={report.imported} tone="green" />
            <ReportStat label="עודכנו (כפולים)" value={report.updated} tone="blue" />
            <ReportStat label="דולגו (שגויים)" value={report.skipped} tone="red" />
          </div>

          {(report.warningCount > 0 || report.errorCount > 0) && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-5">
              <div className="text-[13px] font-black text-amber-900 mb-2">
                ⚠️ {report.errorCount} שגיאות · {report.warningCount} אזהרות (ת.ז/טלפון לא תקינים — יובאו בכל זאת)
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {[...(report.errors || []), ...(report.warnings || [])].slice(0, 20).map((e: any, i: number) => (
                  <div key={i} className="text-[11px] text-amber-800 tabular-nums">
                    שורה {e.row}: {e.message} {e.value ? `(${e.value})` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <a href="/leads" className="btn-vibrant" style={{ fontSize: 14, padding: "12px 24px" }}>
              <Sparkles className="size-4" />
              צפה בלידים
              <ChevronLeft className="size-4" />
            </a>
            <button onClick={reset} className="h-12 px-5 rounded-xl bg-bingo-gray-100 text-bingo-charcoal text-[13px] font-bold hover:bg-bingo-gray-200 inline-flex items-center gap-2">
              <RefreshCw className="size-4" />
              ייבוא נוסף
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportStat({ label, value, tone }: { label: string; value: number; tone: "gray" | "green" | "blue" | "red" }) {
  const tones = {
    gray: "bg-bingo-gray-50 border-bingo-gray-200 text-bingo-black",
    green: "bg-bingo-green/8 border-bingo-green/30 text-bingo-green-deep",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={cn("rounded-2xl border p-4 text-center", tones[tone])}>
      <div className="text-[28px] font-black tabular-nums leading-none">{(value ?? 0).toLocaleString()}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider mt-1.5 opacity-70">{label}</div>
    </div>
  );
}
