"use client";
/**
 * דיוקן הלקוח החי — קוקפיט 6.
 * פאנל דביק שנבנה תוך כדי שיחה: כל תשובה מצטיירת בו מיד.
 * הנציג תמיד יודע מה ידוע, מה חסר, ולאן הלקוח מקוטלג — בלי לגלול.
 * נגזר טהור מ-values + catalog. אפס לוגיקה משלו.
 */
import * as React from "react";
import {
  Coins, Target, ShieldCheck, Briefcase, Wallet, MapPin, Car, Landmark, Route,
} from "lucide-react";
import type { ClassicValues } from "@/lib/yoatsim/values";
import type { CatalogResult } from "@/lib/catalog";
import { CLIENT_COLOR_META } from "@/lib/catalog";
import { str } from "./shared";

function money(v: unknown): string | null {
  const d = String(v ?? "").replace(/\D/g, "");
  return d ? `${Number(d).toLocaleString("he-IL")} ₪` : null;
}

interface RowSpec {
  key: string;
  label: string;
  icon: React.ReactNode;
  value: string | null;
  ghost: string;
}

export function LivePortrait({ values: v, catalog, fullName, phone }: {
  values: ClassicValues;
  catalog: CatalogResult;
  fullName: string;
  phone: string | null;
}) {
  const colorMeta = catalog.clientColor ? CLIENT_COLOR_META[catalog.clientColor] : null;

  const indication =
    catalog.creditIndication === "positive" ? "חיובי" :
    catalog.creditIndication === "negative" ? "שלילי" : "לא ידוע";

  const vehicle =
    str(v.hasVehicleRaw) === "כן" ? `יש${str(v.vehicleExactYear) ? ` · ${str(v.vehicleExactYear)}` : ""}` :
    str(v.hasVehicleRaw) === "כן משועבד" ? "משועבד" :
    str(v.hasVehicleRaw) === "לא" ? "אין" : null;

  const addr = [str(v.city), str(v.street)].filter(Boolean).join(", ");

  const rows: RowSpec[] = [
    { key: "amount", label: "סכום ומטרה", icon: <Coins className="size-3.5" strokeWidth={1.75} />,
      value: money(v.amountRequested) ? `${money(v.amountRequested)}${str(v.loanPurpose) ? ` · ${str(v.loanPurpose)}` : ""}` : null,
      ghost: "כמה ולמה?" },
    { key: "indication", label: "חיווי אשראי", icon: <ShieldCheck className="size-3.5" strokeWidth={1.75} />,
      value: catalog.creditIndication !== "unknown" ? indication : null, ghost: "שאלות הסינון" },
    { key: "employment", label: "תעסוקה", icon: <Briefcase className="size-3.5" strokeWidth={1.75} />,
      value: str(v.employment) || null, ghost: "שכיר? עצמאי?" },
    { key: "income", label: "נטו חודשי", icon: <Wallet className="size-3.5" strokeWidth={1.75} />,
      value: money(v.monthlyIncome), ghost: "הכנסה" },
    { key: "address", label: "כתובת", icon: <MapPin className="size-3.5" strokeWidth={1.75} />,
      value: addr || null, ghost: "עיר ורחוב" },
    { key: "vehicle", label: "רכב", icon: <Car className="size-3.5" strokeWidth={1.75} />,
      value: vehicle, ghost: "הגיבוי — תמיד לשאול" },
    { key: "bank", label: "בנק", icon: <Landmark className="size-3.5" strokeWidth={1.75} />,
      value: str(v.bankName) ? `${str(v.bankName)}${str(v.bankBranch) ? ` · ${str(v.bankBranch)}` : ""}` : null,
      ghost: "חשבון" },
  ];

  const filled = rows.filter((r) => r.value).length;

  return (
    <aside className="epv6-portrait w-[290px] shrink-0 hidden xl:block" aria-label="דיוקן הלקוח">
      {/* זהות */}
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="size-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0"
          style={{
            background: colorMeta ? `color-mix(in srgb, ${colorMeta.hex} 22%, transparent)` : "rgba(255,255,255,.08)",
            color: colorMeta ? colorMeta.hex : "rgba(250,250,249,.7)",
          }}
        >
          {fullName.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="text-[14.5px] font-bold text-[#FAFAF9] truncate leading-tight">{fullName}</p>
          {phone && <p className="text-[11.5px] text-white/40 tabular-nums" dir="ltr">{phone}</p>}
        </div>
      </div>

      {/* פסק-הדין + המסלולים */}
      <div className="mb-3 space-y-1.5">
        <span className="epv5-verdict !min-h-[34px] !text-[13px] w-full justify-center">
          <span className="epv5-verdict-dot" aria-hidden />
          {catalog.label}
        </span>
        <div className="flex gap-1.5">
          <span className={`flex-1 text-center rounded-full py-1 text-[10.5px] font-bold ${
            catalog.tracks.general ? "bg-[#DAFFCB]/15 text-[#9BF56E]" : "bg-white/[.04] text-white/25"
          }`}>
            <Route className="inline size-3 -mt-px" /> כל מטרה
          </span>
          <span className={`flex-1 text-center rounded-full py-1 text-[10.5px] font-bold ${
            catalog.tracks.vehicle ? "bg-[#DCEBF7]/15 text-[#79C0FF]" : "bg-white/[.04] text-white/25"
          }`}>
            <Car className="inline size-3 -mt-px" /> רכב
          </span>
        </div>
      </div>

      {/* השורות — מצטיירות כשהן נענות */}
      <div>
        {rows.map((r) => (
          <div key={r.key} className={`epv6-portrait-row ${r.value ? "is-filled" : ""}`}>
            <span className="epv6-portrait-ico">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="epv6-portrait-label">{r.label}</p>
              {r.value
                ? <p className="epv6-portrait-value truncate">{r.value}</p>
                : <p className="epv6-portrait-ghost">{r.ghost}</p>}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10.5px] text-white/30 text-center tabular-nums">
        {filled}/{rows.length} מהתמונה הושלמה
      </p>
    </aside>
  );
}
