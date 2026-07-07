"use client";
/**
 * הגדרת שדות — מפת השדות המותאמים של Yoatsim (שכפול §2.2 באפיון).
 * טאבים לפי סוג כרטיס; "כרטיס" מציג את 15 סקשני הכרטיס מ-card-schema.
 */
import * as React from "react";
import { CARD_SECTIONS, type FieldDef, type FieldType } from "@/lib/yoatsim/card-schema";
import { EyeOff, ListFilter } from "lucide-react";

const TYPE_LABELS: Record<FieldType, { label: string; chip: string }> = {
  "text": { label: "טקסט", chip: "b-chip-gray" },
  "textarea": { label: "טקסט ארוך", chip: "b-chip-gray" },
  "number": { label: "מספר", chip: "b-chip-blue" },
  "money": { label: "סכום ₪", chip: "b-chip-green" },
  "date": { label: "תאריך", chip: "b-chip-blue" },
  "select": { label: "בחירה מרשימה", chip: "b-chip-orange" },
  "buttons": { label: "כפתורים", chip: "b-chip-orange" },
  "multi-buttons": { label: "בחירה מרובה (תגיות)", chip: "b-chip-orange" },
  "checkbox": { label: "כן/לא", chip: "b-chip-dark" },
  "traffic": { label: "רמזור", chip: "b-chip-red" },
  "readonly": { label: "קריאה בלבד", chip: "b-chip-gray" },
};

const CARD_TYPES = ["כרטיס", "שכפול", "כרטיס בדיקה"] as const;

/** שדות לא בשימוש — מהאפיון §2.2 */
const UNUSED_FIELDS = [
  "fbc", "fbp", "gaid", "referrer", "utm_source", "utm_medium", "utm_campaign", "landing_page", "Click ID",
];

const CUSTOM_SECTION_NOTES: Record<string, string> = {
  "smiley-banner": "סקשן מיוחד — באנר סמיילי (מתעדכן מהבוט)",
  "lenders": "סקשן מיוחד — טבלת גופי המימון (6 גופים + סה\"כ אוטומטי)",
  "source": "סקשן מיוחד — מקור הליד (מתמלא מהייבוא/API)",
  "forms": "סקשן מיוחד — טפסים וקבצים מצורפים",
};

function showIfText(f: FieldDef): string | null {
  if (!f.showIf) return null;
  if (f.showIf.equals !== undefined) return `מוצג אם: ${f.showIf.key} = ${f.showIf.equals}`;
  if (f.showIf.oneOf) return `מוצג אם: ${f.showIf.key} = ${f.showIf.oneOf.join(" / ")}`;
  return null;
}

function FieldRow({ field, extra }: { field: FieldDef; extra?: boolean }) {
  const type = TYPE_LABELS[field.type];
  const condition = showIfText(field);
  return (
    <li className={`py-2.5 border-b border-bingo-gray-100 last:border-0 ${extra ? "opacity-80" : ""}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13px] font-extrabold text-bingo-black">{field.label}</span>
        <span className="text-[11px] font-mono text-bingo-gray-400" dir="ltr">{field.key}</span>
        <span className={`b-chip ${type.chip}`}>{type.label}</span>
        {field.options && field.options.length > 0 && (
          <span
            className="b-chip b-chip-blue inline-flex items-center gap-1 cursor-help"
            title={field.options.join(" · ")}
          >
            <ListFilter className="size-3" />
            {field.options.length} אפשרויות
          </span>
        )}
        {field.ephemeral && (
          <span className="b-chip b-chip-red inline-flex items-center gap-1">
            <EyeOff className="size-3" />
            לא נשמר
          </span>
        )}
      </div>
      {condition && (
        <div className="mt-1 text-[11px] font-bold text-bingo-gray-500">{condition}</div>
      )}
      {field.note && <div className="mt-1 text-[11px] text-bingo-gray-500">{field.note}</div>}
    </li>
  );
}

export function FieldsExplorer() {
  const [cardType, setCardType] = React.useState<(typeof CARD_TYPES)[number]>("כרטיס");

  const totalFields = CARD_SECTIONS.reduce(
    (sum, s) => sum + s.fields.length + (s.collapsedExtras?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* כותרת + טאבים */}
      <div className="b-card p-5">
        <div className="b-eyebrow">זרימת עבודה</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          הגדרת שדות
          <span className="b-chip b-chip-green">
            {CARD_SECTIONS.length} סקשנים · {totalFields} שדות
          </span>
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          מפת השדות המותאמים של הכרטיס — שכפול נאמן ל-Yoatsim; עריכת שדות תיפתח בשלב הבא.
        </p>
        <div className="b-segment mt-4">
          {CARD_TYPES.map((t) => (
            <button key={t} data-active={cardType === t} onClick={() => setCardType(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {cardType !== "כרטיס" ? (
        <div className="b-card p-8 text-center">
          <div className="text-3xl mb-2">🗂️</div>
          <div className="text-[14px] font-extrabold text-bingo-black">
            אין שדות מותאמים לסוג כרטיס זה עדיין
          </div>
          <p className="text-[12px] text-bingo-gray-500 mt-1">
            ב-Yoatsim סוג &quot;{cardType}&quot; קיים אך ללא מפת שדות ייעודית.
          </p>
        </div>
      ) : (
        <>
          {CARD_SECTIONS.map((section) => (
            <div key={section.id} className="b-card p-5">
              <div className="flex items-center gap-2 mb-1">
                {section.bullet === "green" && <span className="size-2.5 rounded-full bg-bingo-green shrink-0" />}
                {section.bullet === "dot" && <span className="size-2.5 rounded-full bg-bingo-gray-300 shrink-0" />}
                <h3 className="text-[15px] font-extrabold text-bingo-black">{section.title}</h3>
                <span className="text-[11px] font-mono text-bingo-gray-400" dir="ltr">{section.id}</span>
              </div>

              {section.custom && (
                <div className="mt-2 rounded-xl bg-bingo-gray-50 border border-bingo-gray-100 px-3.5 py-2 text-[12px] font-bold text-bingo-gray-600">
                  {CUSTOM_SECTION_NOTES[section.custom] ?? "סקשן מיוחד"}
                </div>
              )}

              {section.fields.length > 0 && (
                <ul className="mt-1">
                  {section.fields.map((f) => (
                    <FieldRow key={f.key} field={f} />
                  ))}
                </ul>
              )}

              {section.collapsedExtras && section.collapsedExtras.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dashed border-bingo-gray-200">
                  <div className="b-eyebrow mb-1">שדות נוספים (לא תמיד מוצגים)</div>
                  <ul>
                    {section.collapsedExtras.map((f) => (
                      <FieldRow key={f.key} field={f} extra />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* שדות לא בשימוש — מהאפיון */}
          <div className="b-card p-5">
            <h3 className="text-[15px] font-extrabold text-bingo-gray-500 flex items-center gap-2">
              <EyeOff className="size-4" />
              שדות לא בשימוש
            </h3>
            <p className="text-[11px] text-bingo-gray-500 mt-0.5 mb-3">
              קיימים במקור לצרכי מעקב שיווקי — לא מוצגים בכרטיס.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {UNUSED_FIELDS.map((key) => (
                <span key={key} className="b-chip b-chip-gray font-mono" dir="ltr">
                  {key}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
