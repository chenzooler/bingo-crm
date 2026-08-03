"use client";
/**
 * נתונים בנקאיים — בנק (רשימה חיה עם לוגו מ-/api/banks/list, נפילה
 * לרשימת BANKS_Y), סניף בהשלמה אוטומטית (מאחסן קוד, מציג תווית),
 * חשבון, הלוואות פעילות ופירוט.
 */
import * as React from "react";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { BANKS_Y, ACTIVE_LOANS_Y } from "@/lib/yoatsim/card-schema";
import { AutocompleteInput, type AcSuggestion } from "./AutocompleteInput";
import { Field, LogoBadge, MultiChips, str, arr } from "./shared";
import { ChevronDown, Check } from "lucide-react";

interface BankRow { code: string; name: string; logo?: string | null }
interface BranchRow { code: string; name: string; city?: string; label?: string }

/** הפורמט השמור כמו היום: "לאומי (10)" — מעדיפים את המחרוזת המדויקת מ-BANKS_Y */
function storedBankName(b: BankRow): string {
  const n = parseInt(b.code, 10);
  const exact = BANKS_Y.find((y) => y === `${b.name} (${n})`);
  if (exact) return exact;
  const byName = BANKS_Y.find((y) => y.startsWith(`${b.name} (`));
  return byName ?? `${b.name} (${Number.isNaN(n) ? b.code : n})`;
}

function bankCodeFromStored(stored: string): string | null {
  const m = /\((\d+)\)/.exec(stored);
  if (m) return m[1];
  // ערכים ישנים/מיובאים שמורים כשם בלבד ("הפועלים") - מזהים לפי BANKS_Y
  const s = stored.trim();
  if (!s) return null;
  const match = BANKS_Y.find((y) => y.startsWith(`${s} (`));
  const m2 = match ? /\((\d+)\)/.exec(match) : null;
  return m2 ? m2[1] : null;
}

export function BankFields({ state }: { state: ClassicCardState }) {
  const v = state.values;
  const [banks, setBanks] = React.useState<BankRow[] | null | "error">(null);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/banks/list");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) setBanks((data.banks ?? []) as BankRow[]);
      } catch {
        if (alive) setBanks("error");
      }
    })();
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const bankName = str(v.bankName);
  const bankCode = bankCodeFromStored(bankName);
  const selectedBank = Array.isArray(banks)
    ? banks.find((b) => storedBankName(b) === bankName) ?? null
    : null;

  /* תצוגת הסניף: הקוד שמור ב-bankBranch, התווית מקומית אחרי בחירה */
  const [branchLabel, setBranchLabel] = React.useState<string>("");
  const branchDisplay = branchLabel || str(v.bankBranch);

  const fetchBranches = React.useCallback(async (q: string): Promise<AcSuggestion[]> => {
    if (!bankCode) return [];
    const res = await fetch(`/api/banks/branches?bank=${encodeURIComponent(bankCode)}&q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("branches unavailable");
    const data = await res.json();
    return ((data.branches ?? []) as BranchRow[]).map((b) => ({
      name: b.label ?? `${b.code} ${b.name}`,
      code: b.code,
      extra: b.city,
    }));
  }, [bankCode]);

  return (
    <div className="space-y-4">
      <p className="text-[14px] font-bold text-bingo-black">נתונים בנקאיים</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="בנק">
          {banks === "error" || banks === null ? (
            /* נפילה: הרשימה הקבועה — הכרטיס לא נחסם */
            <select
              className="b-input w-full appearance-none cursor-pointer"
              value={bankName}
              onChange={(e) => state.set("bankName", e.target.value)}
            >
              <option value="">בחירת בנק</option>
              {BANKS_Y.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <div ref={rootRef} className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="b-input w-full flex items-center gap-2 text-start cursor-pointer"
              >
                {selectedBank && <LogoBadge src={selectedBank.logo} name={selectedBank.name} size={22} />}
                <span className={`flex-1 truncate ${bankName ? "text-bingo-black" : "text-bingo-gray-400"}`}>
                  {bankName || "בחירת בנק"}
                </span>
                <ChevronDown size={15} strokeWidth={1.75} className="text-bingo-gray-400 shrink-0" />
              </button>
              {open && (
                <ul role="listbox" className="absolute z-30 top-full mt-1 w-full bg-white border border-bingo-gray-150 rounded-[16px] shadow-lg py-1 max-h-72 overflow-y-auto" style={{ insetInlineStart: 0 }}>
                  {banks.map((b) => {
                    const stored = storedBankName(b);
                    const selected = stored === bankName;
                    return (
                      <li key={b.code} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          onClick={() => {
                            state.set("bankName", stored);
                            state.set("bankBranch", "");
                            setBranchLabel("");
                            setOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] text-start text-[14px] ${
                            selected ? "bg-bingo-gray-100" : "hover:bg-bingo-gray-50"
                          }`}
                        >
                          <LogoBadge src={b.logo} name={b.name} size={24} />
                          <span className="text-bingo-black flex-1">{b.name}</span>
                          <span className="text-[12px] text-bingo-gray-400 tabular-nums">{parseInt(b.code, 10) || b.code}</span>
                          {selected && <Check size={14} strokeWidth={2} className="text-bingo-green-dark" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </Field>

        <Field label="סניף">
          <AutocompleteInput
            value={branchDisplay}
            placeholder={bankCode ? "מספר או שם סניף" : "בחירת בנק תפעיל חיפוש"}
            onText={(text) => {
              setBranchLabel("");
              state.set("bankBranch", text);
            }}
            onPick={(s) => {
              state.set("bankBranch", s.code != null ? String(s.code) : s.name);
              setBranchLabel(s.name);
            }}
            fetcher={fetchBranches}
          />
        </Field>

        <Field label="מספר חשבון">
          <input
            inputMode="numeric"
            dir="ltr"
            className="b-input w-full tabular-nums text-start"
            value={str(v.bankAccount)}
            onChange={(e) => state.set("bankAccount", e.target.value)}
          />
        </Field>
      </div>

      <Field label="הלוואות פעילות ומאיפה">
        <MultiChips
          options={[...ACTIVE_LOANS_Y]}
          values={arr(v.activeLoansFrom)}
          exclusive={["אין"]}
          onChange={(next) => state.set("activeLoansFrom", next)}
        />
      </Field>

      <label className="block">
        <span className="block text-[13px] font-semibold text-bingo-gray-600 mb-2">פירוט והערות</span>
        <textarea
          className="b-input w-full min-h-20 resize-y rounded-[16px]"
          value={str(v.loansDetail)}
          onChange={(e) => state.set("loansDetail", e.target.value)}
        />
      </label>
    </div>
  );
}
