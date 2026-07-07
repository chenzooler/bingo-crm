"use client";
/**
 * מודולים — הדלקה/כיבוי של מודולי המערכת (AppSetting "modules"). שכפול Yoatsim §2.
 * הגדרה קוסמטית בשלב זה — לא חוסמת גישה למסכים.
 */
import * as React from "react";
import Link from "next/link";
import { LayoutGrid, ExternalLink } from "lucide-react";
import { MODULE_LINKS, type ModuleDef } from "@/lib/yoatsim/app-defaults";
import { cn } from "@/lib/utils";
import { AppToggle, SaveBadge, useAppSettingSaver } from "./AppSettingControls";

export default function ModulesManager({ initial }: { initial: ModuleDef[] }) {
  const { value: modules, save, state } = useAppSettingSaver<ModuleDef[]>("modules", initial);
  const activeCount = modules.filter((m) => m.active).length;

  return (
    <div className="space-y-4">
      <div className="b-card p-5">
        <div className="b-eyebrow">מערכת</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          מודולים
          <span className="b-chip b-chip-green">שכפול Yoatsim §2</span>
          <span className="b-chip b-chip-blue tabular-nums">{activeCount}/{modules.length} פעילים</span>
          <SaveBadge state={state} />
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          מודולי המערכת מהמקור — הדלקה וכיבוי לכל מודול.
        </p>
        <p className="text-[11px] text-bingo-gray-400 mt-1.5">
          הערה: בשלב זה הכיבוי הוא הגדרה קוסמטית בלבד (כמו במקור) — הוא לא חוסם גישה למסכים.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((m) => {
          const link = MODULE_LINKS[m.key];
          return (
            <div
              key={m.key}
              className={cn(
                "b-card !p-4 flex flex-col gap-2.5 transition",
                !m.active && "opacity-60",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("b-icon !size-9 shrink-0", m.active ? "b-icon-green" : "b-icon-gray")}>
                  <LayoutGrid className="size-4" />
                </span>
                <span className="text-[13.5px] font-extrabold text-bingo-black leading-tight flex-1">{m.name}</span>
                <AppToggle
                  checked={m.active}
                  onChange={(next) =>
                    void save(modules.map((x) => (x.key === m.key ? { ...x, active: next } : x)))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("b-chip text-[10.5px]", m.active ? "b-chip-green" : "b-chip-gray")}>
                  {m.active ? "פעיל" : "כבוי"}
                </span>
                {link && (
                  <Link
                    href={link}
                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-bingo-blue hover:underline"
                  >
                    פתח מסך <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
