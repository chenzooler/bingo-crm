"use client";
/**
 * LiveScript - פאנל התסריט החי שמוצג לנציג *תוך כדי* השיחה (דפוס guided-call).
 * מה יש כאן:
 *   1. טיימר שיחה גדול (mm:ss) + מד התקדמות "כיסית X מתוך Y".
 *   2. נוסח ההסכמה לבדיקת רמזור בגודל טלפרומפטר - מקריאים מילה במילה.
 *   3. כל כלל "חובה" פעיל = שורה גדולה שהנציג מסמן כשאמר אותה (Ctrl+1..9).
 *   4. רצועת "אסור לומר" (כללי forbidden) בטינט אפרסק.
 * הסימונים הם מקומיים לסשן בלבד - הבינה בודקת בפועל מה נאמר אחרי השיחה.
 *
 * מקלדת: הרכיב מאזין רק כש-active=true (השיחה פעילה) ומתנתק ברגע שהפאנל
 * מכובה, כך שהוא לעולם לא מתנגש במקשי הקוקפיט (Enter חיוג / S דילוג / 1-4 סיווג).
 */
import * as React from "react";
import { Check, ShieldAlert, ListChecks, Timer, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceRuleDto } from "./ai-types";

/* נוסח ההסכמה - זהה בסגנון ובניסוח למה שמוקרא ב-RamzorModal */
const CONSENT_SCRIPT =
  "לפני שנמשיך אני צריך את האישור שלך: האם את/ה מאשר/ת לי לבצע בדיקה על נתוני האשראי שלך במאגר BDI? הבדיקה לא כרוכה בעלות ולא מחייבת אותך.";

/** האם הכלל הוא כלל ההסכמה (רמזור/BDI) - הוא מוצג בטלפרומפטר, לא כשורה רגילה */
function isConsentRule(r: ComplianceRuleDto): boolean {
  const hay = `${r.name} ${r.description ?? ""} ${r.criterion} ${r.appliesTo}`;
  return /רמזור|BDI|הסכמ|אישור הלקוח/i.test(hay);
}

/** ברירת מחדל כשאין עדיין כללים ב-DB - הנציג לא נשאר בלי תסריט */
const FALLBACK_RULES: ComplianceRuleDto[] = [
  { id: -1, name: "הצגה עצמית", description: "שם מלא + החברה", kind: "required", criterion: "הנציג הציג את עצמו בשם ואת בינגו", severity: "high", appliesTo: "all", sortOrder: 1 },
  { id: -2, name: "מטרת השיחה", description: "למה אנחנו מתקשרים", kind: "required", criterion: "הנציג הסביר שהלקוח השאיר פנייה לבדיקת מימון", severity: "medium", appliesTo: "all", sortOrder: 2 },
  { id: -3, name: "בדיקת רמזור", description: "נוסח ההסכמה המלא", kind: "required", criterion: "הנציג הקריא את נוסח ההסכמה לבדיקה במאגר וקיבל אישור מפורש", severity: "critical", appliesTo: "ramzor", sortOrder: 3 },
  { id: -4, name: "סכום ומטרה", description: "כמה צריך ולמה", kind: "required", criterion: "הנציג בירר סכום מבוקש ומטרת ההלוואה", severity: "medium", appliesTo: "all", sortOrder: 4 },
  { id: -5, name: "הכנסות והחזרים", description: "הכנסה חודשית + החזר קיים", kind: "required", criterion: "הנציג בירר הכנסה חודשית והחזרים קיימים", severity: "medium", appliesTo: "all", sortOrder: 5 },
  { id: -6, name: "הצעד הבא", description: "מה קורה אחרי השיחה", kind: "required", criterion: "הנציג סיכם ללקוח מה השלב הבא ומתי חוזרים אליו", severity: "medium", appliesTo: "closing", sortOrder: 6 },
  { id: -7, name: "הבטחת אישור", kind: "forbidden", description: null, criterion: "אסור להבטיח שההלוואה תאושר", severity: "critical", appliesTo: "all", sortOrder: 7 },
  { id: -8, name: "ריבית מובטחת", kind: "forbidden", description: null, criterion: "אסור לנקוב בריבית או בתנאים סופיים לפני אישור הגוף המממן", severity: "high", appliesTo: "all", sortOrder: 8 },
];

function mmss(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LiveScript({ active, startedAt }: {
  /** השיחה פעילה - מפעיל טיימר ומאזין מקלדת */
  active: boolean;
  /** חותמת הזמן שבה החל החיוג (ms) */
  startedAt: number | null;
}) {
  const [rules, setRules] = React.useState<ComplianceRuleDto[] | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [ticked, setTicked] = React.useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = React.useState(0);

  /* ---------- טעינת הכללים (פעם אחת, מגן על עצמו מ-404) ---------- */
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/rules");
        if (!res.ok) throw new Error("not-ready");
        const data = await res.json();
        const list: ComplianceRuleDto[] = Array.isArray(data) ? data : Array.isArray(data?.rules) ? data.rules : [];
        if (cancelled) return;
        setRules(list.length ? list : FALLBACK_RULES);
        setLoadFailed(false);
      } catch {
        if (cancelled) return;
        setRules(FALLBACK_RULES);
        setLoadFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---------- איפוס הסימונים בכל שיחה חדשה ---------- */
  React.useEffect(() => {
    if (startedAt) setTicked(new Set());
  }, [startedAt]);

  /* ---------- טיימר ---------- */
  React.useEffect(() => {
    if (!active || !startedAt) { setElapsed(0); return; }
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [active, startedAt]);

  const sorted = React.useMemo(
    () => [...(rules ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [rules],
  );
  const required = React.useMemo(() => sorted.filter((r) => r.kind !== "forbidden"), [sorted]);
  const forbidden = React.useMemo(() => sorted.filter((r) => r.kind === "forbidden"), [sorted]);
  const consentRule = React.useMemo(() => required.find(isConsentRule) ?? null, [required]);
  const lines = React.useMemo(
    () => required.filter((r) => r.id !== consentRule?.id),
    [required, consentRule],
  );

  const toggle = React.useCallback((id: number) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  /* ---------- מקלדת: Ctrl/⌘ + 1..9 מסמן שורה ----------
     פעיל אך ורק כשהשיחה פעילה, ולכן לא נוגע במקשי הקוקפיט (Enter/S/1-4). */
  const linesRef = React.useRef(lines);
  linesRef.current = lines;
  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 9) return;
      const target = linesRef.current[n - 1];
      if (!target) return;
      e.preventDefault();
      toggle(target.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, toggle]);

  if (!active) return null;

  const totalRequired = required.length;
  const doneCount = required.filter((r) => ticked.has(r.id)).length;
  const pct = totalRequired ? Math.round((doneCount / totalRequired) * 100) : 0;

  return (
    <div className="b-spring-in mt-6 rounded-[24px] p-4 sm:p-5" style={{
      background: "radial-gradient(520px 300px at 88% 0%, var(--b-tint-mint-1), transparent 62%), linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.5))",
      border: "1px solid var(--color-bingo-gray-100, rgba(0,0,0,.06))",
    }}>
      {/* ===== כותרת: טיימר + התקדמות ===== */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className="b-glass-ico size-10 rounded-2xl flex items-center justify-center shrink-0">
          <Timer className="size-5 text-bingo-black" />
        </span>
        <div className="leading-none">
          <div className="text-[34px] sm:text-[40px] font-black text-bingo-black tabular-nums tracking-tight">
            {mmss(elapsed)}
          </div>
          <div className="text-[10.5px] font-bold text-bingo-gray-500 mt-1">משך השיחה</div>
        </div>
        <div className="mr-auto min-w-[190px]">
          <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-bingo-gray-600 mb-1.5">
            <ListChecks className="size-3.5" />
            {rules === null ? "טוען תסריט..." : `כיסית ${doneCount} מתוך ${totalRequired}`}
          </div>
          <div className="h-2 rounded-full bg-black/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-bingo-green transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {rules === null && (
        <div className="flex items-center gap-2 text-[12.5px] font-bold text-bingo-gray-500 py-4">
          <Loader2 className="size-4 animate-spin" /> טוען את כללי הבקרה...
        </div>
      )}

      {/* ===== נוסח ההסכמה - טלפרומפטר ===== */}
      {consentRule && (
        <button
          type="button"
          onClick={() => toggle(consentRule.id)}
          className={cn(
            "b-lift b-glass w-full text-right rounded-[20px] px-5 py-4 mb-3 block transition-colors",
            ticked.has(consentRule.id) && "ring-2 ring-bingo-green",
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "size-6 rounded-full flex items-center justify-center shrink-0 border-2",
              ticked.has(consentRule.id)
                ? "bg-bingo-green border-transparent"
                : "border-bingo-gray-150 bg-white/60",
            )}>
              {ticked.has(consentRule.id) && <Check className="size-3.5 text-bingo-black" strokeWidth={3.5} />}
            </span>
            <span className="text-[12px] font-black text-bingo-gray-600">{consentRule.name} - מקריאים מילה במילה</span>
          </div>
          <div className="text-[19px] sm:text-[21px] font-extrabold leading-[1.6] text-bingo-black text-balance">
            &quot;{CONSENT_SCRIPT}&quot;
          </div>
        </button>
      )}

      {/* ===== שורות החובה ===== */}
      {lines.length > 0 && (
        <div className="space-y-2">
          {lines.map((r, i) => {
            const on = ticked.has(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggle(r.id)}
                aria-pressed={on}
                className={cn(
                  "b-lift w-full text-right flex items-start gap-3 rounded-2xl px-4 py-3 border transition-colors",
                  on
                    ? "b-tint-mint border-transparent"
                    : "bg-white/65 border-bingo-gray-100 hover:bg-white",
                )}
              >
                <span className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5",
                  on ? "bg-bingo-green border-transparent" : "border-bingo-gray-150 bg-white",
                )}>
                  {on && <Check className="size-3.5 text-bingo-black" strokeWidth={3.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn(
                    "block text-[16px] font-black leading-snug",
                    on ? "text-bingo-black/70 line-through decoration-2" : "text-bingo-black",
                  )}>
                    {r.name}
                  </span>
                  <span className="block text-[12px] font-semibold text-bingo-gray-500 leading-snug mt-0.5">
                    {r.description || r.criterion}
                  </span>
                </span>
                {i < 9 && (
                  <kbd className="text-[10px] font-bold bg-black/8 rounded px-1.5 py-0.5 shrink-0 mt-1 tabular-nums">
                    Ctrl+{i + 1}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ===== אסור לומר ===== */}
      {forbidden.length > 0 && (
        <div className="b-tint-peach rounded-2xl px-4 py-3 mt-3">
          <div className="flex items-center gap-1.5 text-[11.5px] font-black text-bingo-black mb-1.5">
            <ShieldAlert className="size-3.5" />
            אסור לומר
          </div>
          <div className="flex flex-wrap gap-1.5">
            {forbidden.map((r) => (
              <span
                key={r.id}
                className="rounded-full bg-white/70 px-3 py-1 text-[12px] font-bold text-bingo-black"
                title={r.criterion}
              >
                {r.criterion || r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ===== הערת האמת ===== */}
      <p className="mt-3 text-[11px] text-bingo-gray-400 font-semibold">
        הסימון שלך אישי - הבינה בודקת בפועל מה נאמר בשיחה.
        {loadFailed && " (מוצג תסריט ברירת מחדל - כללי הבקרה עוד לא זמינים)"}
      </p>
    </div>
  );
}

export default LiveScript;
