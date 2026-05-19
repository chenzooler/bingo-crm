"use client";
import * as React from "react";
import { LENDERS } from "@/lib/types";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { Plus, Pencil, Power, CheckCircle2, AlertCircle } from "lucide-react";

const LENDER_META: Record<string, { hasApi: boolean; avgResponseTime: string; approvalRate: number }> = {
  isracard: { hasApi: false, avgResponseTime: "3-5 דק", approvalRate: 42 },
  cal: { hasApi: false, avgResponseTime: "2-4 דק", approvalRate: 55 },
  max: { hasApi: false, avgResponseTime: "3 דק", approvalRate: 38 },
  phoenix: { hasApi: true, avgResponseTime: "12 שניות", approvalRate: 67 },
  blender: { hasApi: true, avgResponseTime: "8 שניות", approvalRate: 71 },
  "jerusalem-bank": { hasApi: true, avgResponseTime: "30 שניות", approvalRate: 58 },
  pension: { hasApi: false, avgResponseTime: "תלוי בקרן", approvalRate: 65 },
  "other-bank": { hasApi: false, avgResponseTime: "—", approvalRate: 30 },
  "personal-bank": { hasApi: false, avgResponseTime: "—", approvalRate: 28 },
  insurance: { hasApi: true, avgResponseTime: "15 שניות", approvalRate: 49 },
  fama: { hasApi: false, avgResponseTime: "5 דק", approvalRate: 44 },
  "direct-finance": { hasApi: true, avgResponseTime: "10 שניות", approvalRate: 62 },
};

export default function LendersSettingsPage() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    LENDERS.forEach((l) => (map[l.key] = true));
    return map;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">גופי מימון</div>
            <h2 className="text-xl font-extrabold text-bingo-black">ניהול גופי המימון</h2>
            <p className="text-[12px] text-bingo-gray-600 mt-1">
              {LENDERS.length} גופי מימון · {LENDERS.filter((l) => LENDER_META[l.key]?.hasApi).length} עם API ישיר
            </p>
          </div>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> גוף מימון חדש
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LENDERS.map((l) => {
          const meta = LENDER_META[l.key];
          const isEnabled = enabled[l.key];
          return (
            <div
              key={l.key}
              className={`rounded-2xl border-2 p-4 transition ${
                isEnabled
                  ? "bg-white border-bingo-gray-200 hover:border-bingo-green/40"
                  : "bg-bingo-gray-50 border-bingo-gray-150 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <LenderMark code={l.key} size={42} />
                  <div className="min-w-0">
                    <div className="text-[14px] font-extrabold text-bingo-black">{l.label}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {meta?.hasApi ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2 py-0.5">
                          <CheckCircle2 className="size-3" /> API ישיר
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-bingo-gray-600 bg-bingo-gray-100 rounded-full px-2 py-0.5">
                          <AlertCircle className="size-3" /> ידני / Scraping
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEnabled((e) => ({ ...e, [l.key]: !e[l.key] }))}
                  className={`size-9 rounded-xl inline-flex items-center justify-center transition ${
                    isEnabled ? "bg-bingo-green/15 text-bingo-green-dark hover:bg-bingo-green/25" : "bg-bingo-gray-100 text-bingo-gray-400"
                  }`}
                  title={isEnabled ? "מופעל" : "מושבת"}
                >
                  <Power className="size-4" />
                </button>
              </div>

              {meta && (
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-bingo-gray-100">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-bingo-gray-500 font-bold">זמן תגובה</div>
                    <div className="text-[13px] font-mono tabular-nums font-extrabold text-bingo-black">{meta.avgResponseTime}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-bingo-gray-500 font-bold">% אישור</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] font-mono tabular-nums font-extrabold text-bingo-green-dark">{meta.approvalRate}%</span>
                    </div>
                    <div className="h-1 bg-bingo-gray-100 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-bingo-green-dark rounded-full" style={{ width: `${meta.approvalRate}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 mt-3">
                <button className="h-7 px-2.5 rounded-lg bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-[11px] font-bold inline-flex items-center gap-1">
                  <Pencil className="size-3" /> ערוך
                </button>
                <button className="h-7 px-2.5 rounded-lg bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-[11px] font-bold">
                  הגדר API
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
