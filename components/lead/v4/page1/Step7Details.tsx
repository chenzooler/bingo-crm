"use client";
/**
 * שלב 7 — השלמת פרטים (אחרי חתימה; אפשר גם לפני דרך הקישור השקט).
 * פרטים אישיים, תעסוקה והכנסות, פנסיה, מגורים, רכב, ונתונים בנקאיים.
 */
import * as React from "react";
import { motion } from "framer-motion";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { MARITAL_Y, HOUSING_Y, PENSION_Y } from "@/lib/yoatsim/card-schema";
import { INSURERS } from "./insurers";
import { BankFields } from "./BankFields";
import { ChoicePills, Field, LogoBadge, MoneyInput, str } from "./shared";
import { SPRING, SubSection, useEpSpring } from "./ep";
import { ChevronDown, Check } from "lucide-react";

/** חשיפה מותנית — קפיץ כניסה של נייר חשמלי */
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const spring = useEpSpring();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 14, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={spring(SPRING.entrance)}
    >
      {children}
    </motion.div>
  );
}

const SEIZED_BY = ["מימון ישיר", "פמה", "מזרחי טפחות", "שיעבוד אחר"];
const OTHER_INSURER = "אחר";

function PensionCompanySelect({ state }: { state: ClassicCardState }) {
  const v = state.values;
  const value = str(v.pensionCompany);
  const known = INSURERS.some((i) => i.name === value);
  const [otherMode, setOtherMode] = React.useState(!!value && !known);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (otherMode) {
    return (
      <div className="flex gap-2">
        <input
          className="b-input ep-input w-full"
          placeholder="שם החברה"
          value={value}
          autoFocus
          onChange={(e) => state.set("pensionCompany", e.target.value)}
        />
        <button
          type="button"
          onClick={() => { setOtherMode(false); state.set("pensionCompany", ""); }}
          className="min-h-[44px] px-3 text-[13px] text-bingo-gray-500 hover:text-bingo-black shrink-0"
        >
          לרשימה
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="b-input ep-input w-full flex items-center gap-2 text-start cursor-pointer"
      >
        {known && <LogoBadge src={INSURERS.find((i) => i.name === value)?.logo} name={value} size={22} />}
        <span className={`flex-1 truncate ${value ? "text-bingo-black" : "text-bingo-gray-400"}`}>
          {value || "בחירת חברה"}
        </span>
        <ChevronDown size={15} strokeWidth={1.75} className="text-bingo-gray-400 shrink-0" />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-30 top-full mt-1 w-full bg-white border border-bingo-gray-150 rounded-[16px] shadow-lg py-1 max-h-72 overflow-y-auto" style={{ insetInlineStart: 0 }}>
          {INSURERS.map((ins) => (
            <li key={ins.name} role="option" aria-selected={value === ins.name}>
              <button
                type="button"
                onClick={() => { state.set("pensionCompany", ins.name); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] text-start text-[14px] ${
                  value === ins.name ? "bg-bingo-gray-100" : "hover:bg-bingo-gray-50"
                }`}
              >
                <LogoBadge src={ins.logo} name={ins.name} size={24} />
                <span className="text-bingo-black flex-1">{ins.name}</span>
                {value === ins.name && <Check size={14} strokeWidth={2} className="text-bingo-green-dark" />}
              </button>
            </li>
          ))}
          <li role="option" aria-selected={false}>
            <button
              type="button"
              onClick={() => { setOtherMode(true); setOpen(false); state.set("pensionCompany", ""); }}
              className="w-full px-4 py-2.5 min-h-[44px] text-start text-[14px] text-bingo-gray-600 hover:bg-bingo-gray-50"
            >
              {OTHER_INSURER} - הקלדה חופשית
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export function Step7Details({ state }: { state: ClassicCardState }) {
  const v = state.values;
  const hasPension = str(v.hasPension) === "כן";
  const housingType = str(v.housingType);
  const needsHousingPayment = housingType === "שכירות" || housingType === "בעלות + משכנתא";
  const hasVehicle = str(v.hasVehicleRaw) === "כן" || str(v.hasVehicleRaw) === "כן משועבד";
  const seized = str(v.hasVehicleRaw) === "כן משועבד";
  const yearBand = str(v.vehicleYearBand);
  const vehicleYear = str(v.vehicleYear);
  const yearNum = Number(vehicleYear);
  const yearInvalid = vehicleYear !== "" && (Number.isNaN(yearNum) || yearNum < 2013 || yearNum > 2027);

  return (
    <div className="space-y-7">
      {/* זהות ומשפחה */}
      <SubSection icon="heart-ring" title="זהות ומשפחה">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="תאריך הנפקת ת&quot;ז">
          <input
            type="date" dir="ltr"
            className="b-input ep-input w-full tabular-nums"
            value={str(v.idIssueDate)}
            onChange={(e) => state.set("idIssueDate", e.target.value)}
          />
        </Field>
        <Field label="סטטוס משפחתי">
          <select
            className="b-input ep-input w-full appearance-none cursor-pointer"
            value={str(v.maritalStatus)}
            onChange={(e) => state.set("maritalStatus", e.target.value)}
          >
            <option value="">בחירה</option>
            {MARITAL_Y.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="מספר ילדים מתחת לגיל 18">
          <input
            inputMode="numeric" dir="ltr"
            className="b-input ep-input w-full tabular-nums text-start"
            value={str(v.children)}
            onChange={(e) => state.set("children", e.target.value.replace(/[^\d]/g, ""))}
          />
        </Field>
      </div>
      </SubSection>

      {/* תעסוקה והכנסה */}
      <SubSection icon="briefcase" title="תעסוקה והכנסה">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="שם מקום עבודה או תפקיד">
          <input
            className="b-input ep-input w-full"
            value={str(v.employerAndRole)}
            onChange={(e) => state.set("employerAndRole", e.target.value)}
          />
        </Field>
        <Field label="ותק במקום העבודה בשנים">
          <input
            inputMode="numeric" dir="ltr"
            className="b-input ep-input w-full tabular-nums text-start"
            value={str(v.seniority)}
            onChange={(e) => state.set("seniority", e.target.value.replace(/[^\d.]/g, ""))}
          />
        </Field>
        <Field label="הכנסה חודשית נטו">
          <MoneyInput value={str(v.monthlyIncome)} onChange={(raw) => state.set("monthlyIncome", raw)} />
        </Field>
        <Field label="הכנסת בן/בת זוג נטו">
          <MoneyInput value={str(v.spouseNetPay)} onChange={(raw) => state.set("spouseNetPay", raw)} />
        </Field>
      </div>

      {/* פנסיה */}
      <div className="space-y-4 pt-1">
        <Field label="קרן פנסיה/השתלמות">
          <ChoicePills
            options={PENSION_Y.filter((p) => p !== "צעיר").map((p) => ({ label: p, store: p }))}
            value={str(v.hasPension) === "צעיר" ? "צעיר" : str(v.hasPension)}
            onChange={(stored) => state.set("hasPension", stored)}
          />
        </Field>
        {hasPension && (
          <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="באיזו חברת ביטוח">
              <PensionCompanySelect state={state} />
            </Field>
            <Field label="סכום משוער בקרנות">
              <MoneyInput value={str(v.pensionAmount)} onChange={(raw) => state.set("pensionAmount", raw)} />
            </Field>
          </Reveal>
        )}
      </div>
      </SubSection>

      {/* מגורים */}
      <SubSection icon="house" title="מגורים">
      <div className="space-y-4">
        <Field label="סוג מגורים">
          <ChoicePills
            options={[...HOUSING_Y]}
            value={housingType}
            onChange={(stored) => state.set("housingType", stored)}
          />
        </Field>
        {needsHousingPayment && (
          <Reveal className="sm:max-w-64">
            <Field label="החזר חודשי">
              <MoneyInput
                value={str(v.monthlyHousingPayment)}
                onChange={(raw) => state.set("monthlyHousingPayment", raw)}
              />
            </Field>
          </Reveal>
        )}
      </div>
      </SubSection>

      {/* רכב */}
      <SubSection icon="car" title="רכב">
      <div className="space-y-4">
        <Field label="רכב">
          <ChoicePills
            options={["כן", "כן משועבד", "לא"]}
            value={str(v.hasVehicleRaw)}
            onChange={(stored) => state.set("hasVehicleRaw", stored)}
          />
        </Field>
        {hasVehicle && (
          <Reveal className="space-y-4">
            <Field label="שנת ייצור">
              <ChoicePills
                options={["מעל 2013", "מתחת 2013"]}
                value={yearBand}
                onChange={(stored) => state.set("vehicleYearBand", stored)}
              />
            </Field>
            {yearBand === "מעל 2013" && (
              <Reveal className="sm:max-w-64">
                <Field label="שנת הרכב המדויקת">
                  <div>
                    <input
                      inputMode="numeric" dir="ltr"
                      className={`b-input ep-input w-full tabular-nums text-start ${yearInvalid ? "border-status-red" : ""}`}
                      placeholder="2013-2027"
                      value={vehicleYear}
                      onChange={(e) => state.set("vehicleYear", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                    />
                    {yearInvalid && (
                      <p className="text-[12px] text-status-red mt-1.5">שנה בין 2013 ל-2027</p>
                    )}
                  </div>
                </Field>
              </Reveal>
            )}
            {seized && (
              <Reveal className="space-y-4">
                <Field label="מאיפה השיעבוד">
                  <ChoicePills
                    options={SEIZED_BY}
                    value={str(v.seizedBy)}
                    onChange={(stored) => state.set("seizedBy", stored)}
                  />
                </Field>
                {str(v.seizedBy) === "שיעבוד אחר" && (
                  <Reveal className="sm:max-w-80">
                    <Field label="פירוט השיעבוד">
                      <input
                        className="b-input ep-input w-full"
                        value={str(v.seizedByOther)}
                        onChange={(e) => state.set("seizedByOther", e.target.value)}
                      />
                    </Field>
                  </Reveal>
                )}
              </Reveal>
            )}
          </Reveal>
        )}
      </div>
      </SubSection>

      <hr className="border-bingo-gray-150" />

      <BankFields state={state} />
    </div>
  );
}
