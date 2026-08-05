"use client";
/**
 * קלט השלמה אוטומטית גנרי — ערים / רחובות / סניפי בנק.
 * הקלדה → הצעות (debounce 250ms), חיצים + Enter לבחירה, Esc לסגירה.
 * כשל רשת/404 → הקלט ממשיך לעבוד כטקסט חופשי, הכרטיס לא נחסם לעולם.
 */
import * as React from "react";

export interface AcSuggestion {
  name: string;
  code?: string;
  /** טקסט משני בשורה (למשל עיר של סניף) */
  extra?: string;
}

export function AutocompleteInput({
  value, onText, onPick, fetcher, placeholder, disabled, minChars = 1, dirLtr,
}: {
  /** ערך התצוגה הנוכחי */
  value: string;
  /** הקלדה חופשית — נשמרת כמו שהיא */
  onText: (text: string) => void;
  /** בחירת הצעה מהרשימה */
  onPick: (s: AcSuggestion) => void;
  fetcher: (q: string) => Promise<AcSuggestion[]>;
  placeholder?: string;
  disabled?: boolean;
  minChars?: number;
  dirLtr?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<AcSuggestion[]>([]);
  const [active, setActive] = React.useState(-1);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const search = React.useCallback((q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < minChars) {
      setItems([]); setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const mySeq = ++seq.current;
      try {
        const res = await fetcher(q.trim());
        if (mySeq !== seq.current) return;
        setItems(res.slice(0, 8));
        setActive(-1);
        setOpen(res.length > 0);
      } catch {
        // אין הצעות — טקסט חופשי ממשיך לעבוד
        if (mySeq === seq.current) { setItems([]); setOpen(false); }
      }
    }, 130);
  }, [fetcher, minChars]);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // סגירה בלחיצה מחוץ
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (s: AcSuggestion) => {
    setOpen(false);
    setItems([]);
    onPick(s);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter") {
      if (active >= 0) {
        e.preventDefault();
        pick(items[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        className="b-input ep-input w-full"
        dir={dirLtr ? "ltr" : undefined}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => { onText(e.target.value); search(e.target.value); }}
        onFocus={() => { if (items.length > 0) setOpen(true); }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          role="listbox"
          className="epv5-pop absolute z-30 top-full w-full mt-1 overflow-hidden"
          style={{ insetInlineStart: 0 }}
        >
          {items.map((s, i) => {
            /* הדגשת ההתאמה — "כפר יו" מודגש בתוך "כפר יונה" */
            const q = value.trim();
            const at = q ? s.name.indexOf(q) : -1;
            return (
              <li key={`${s.code ?? s.name}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                  onMouseEnter={() => setActive(i)}
                  className={`epv5-opt ${i === active ? "is-active" : ""}`}
                >
                  <span className="text-bingo-black">
                    {at >= 0 ? (
                      <>
                        {s.name.slice(0, at)}
                        <b className="epv5-match">{s.name.slice(at, at + q.length)}</b>
                        {s.name.slice(at + q.length)}
                      </>
                    ) : s.name}
                  </span>
                  {s.extra && <span className="sub">{s.extra}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
