"use client";
import * as React from "react";
import { Search, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallReview } from "./CallReviewContext";
import { formatDuration, type TranscriptSegment } from "./quality-utils";

/**
 * התמלול כשיחה: הנציג בימין (מנטה), הלקוח בשמאל (תכלת).
 * כל בועה = כפתור שמקפיץ את ההקלטה לזמן שלה, והבועה המתנגנת מודגשת.
 * חיפוש מסנן ומדגיש. אין סגמנטים? נופלים לטקסט המלא.
 */
export function CallTranscriptPanel({
  segments,
  fullText,
}: {
  segments: TranscriptSegment[];
  fullText: string | null;
}) {
  const { seekTo, currentTime } = useCallReview();
  const [query, setQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const activeIndex = React.useMemo(() => {
    if (segments.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (currentTime >= s.start && (currentTime < s.end || s.end <= s.start)) return i;
      if (currentTime >= s.start) idx = i;
    }
    return idx;
  }, [segments, currentTime]);

  const q = query.trim();
  const filtered = React.useMemo(() => {
    if (!q) return segments.map((s, i) => ({ seg: s, i }));
    return segments.map((s, i) => ({ seg: s, i })).filter(({ seg }) => seg.text.includes(q));
  }, [segments, q]);

  // גלילה אוטומטית לבועה המתנגנת (רק כשלא מחפשים)
  React.useEffect(() => {
    if (q || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-seg="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, q]);

  const hasSegments = segments.length > 0;

  return (
    <section className="b-card !p-0 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-bingo-gray-100">
        <span className="b-icon b-icon-dark !size-8 shrink-0">
          <FileText className="size-4" />
        </span>
        <h2 className="text-[15px] font-bold text-bingo-black">תמלול השיחה</h2>
        {hasSegments && (
          <span className="b-chip b-chip-gray text-[10px]">{segments.length} קטעים</span>
        )}
        {hasSegments && (
          <div className="mr-auto relative">
            <Search className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-bingo-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש בתמלול"
              className="b-input !h-9 !w-52 !pr-8 !pl-7 !text-[12px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-bingo-gray-400 hover:text-bingo-black"
                aria-label="נקה חיפוש"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div ref={listRef} className="max-h-[560px] overflow-y-auto p-4 space-y-2.5">
        {hasSegments ? (
          filtered.length > 0 ? (
            filtered.map(({ seg, i }) => {
              const isAgent = seg.speaker === "agent";
              const active = i === activeIndex && !q;
              return (
                <div key={i} data-seg={i} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[84%] min-w-0", isAgent ? "text-right" : "text-left")}>
                    <div className="flex items-center gap-1.5 mb-1" dir="rtl">
                      <span className="text-[10px] font-bold text-bingo-gray-500">
                        {isAgent ? "נציג" : "לקוח"}
                      </span>
                      <button
                        type="button"
                        onClick={() => seekTo(seg.start)}
                        className="text-[10px] font-mono tabular-nums text-bingo-gray-400 hover:text-bingo-black transition"
                        title="הקפץ את ההקלטה לכאן"
                      >
                        {formatDuration(seg.start)}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => seekTo(seg.start)}
                      className={cn(
                        "block w-full text-right rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed text-bingo-black transition",
                        isAgent ? "b-tint-mint" : "b-tint-sky",
                        active ? "ring-2 ring-bingo-green shadow-md" : "hover:brightness-[0.98]",
                      )}
                    >
                      <Highlighted text={seg.text} query={q} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-[13px] text-bingo-gray-500">
              אין קטעים שמכילים &quot;{q}&quot;
            </div>
          )
        ) : fullText ? (
          <div className="rounded-2xl bg-bingo-gray-50 border border-bingo-gray-100 p-4 text-[13px] leading-relaxed text-bingo-charcoal whitespace-pre-wrap">
            {fullText}
          </div>
        ) : (
          <div className="py-12 text-center text-[13px] text-bingo-gray-500">
            עדיין אין תמלול לשיחה הזו
          </div>
        )}
      </div>
    </section>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(query);
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 && (
            <mark className="bg-bingo-green/50 text-bingo-black rounded px-0.5">{query}</mark>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
