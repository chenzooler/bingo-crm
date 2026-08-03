"use client";
/**
 * שלב 6 — תסריט שיחה ומעבר להסכם.
 * כרטיס קריאה בפולין מוגדל (וריאנט כל-מטרה / רכב), שליחת הסכם התקשרות,
 * סטטוס חי (נשלח → הלקוח פתח → נחתם) עם "סמן כנחתם", וואטסאפ ומייל.
 */
import * as React from "react";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import type { AgreementApi } from "./useAgreement";
import { str } from "./shared";
import { FileSignature, MessageCircle, Mail, Check, Clock3 } from "lucide-react";

function scriptFor(vehicleTrack: boolean, firstName: string): string[] {
  const name = firstName ? ` ${firstName}` : "";
  if (vehicleTrack) {
    return [
      `אז ככה${name}, אני אסביר איך זה עובד אצלנו בבינגו. אנחנו חברת תיווך אשראי, ובמקרה שלך המסלול המתאים הוא הלוואה כנגד הרכב - הרכב משמש בטוחה, וזה מה שמאפשר לגופי המימון לבחון את הבקשה גם כשנתוני האשראי פחות פשוטים.`,
      `אנחנו עובדים מול מספר גופי מימון מפוקחים, ומגישים את הבקשה עבורך כדי לבדוק איפה אפשר לקבל את התנאים הטובים ביותר בהתאם לנתונים שלך ולרכב.`,
      `חשוב לי להדגיש - הבדיקה עצמה לא עולה כסף ולא מחייבת אותך בכלום. שכר הטרחה שלנו נגבה רק אם ההלוואה מתקבלת בפועל, ורק אחרי שקיבלת אותה.`,
      `כדי שנתחיל בבדיקה, אני שולח לך עכשיו הסכם התקשרות דיגיטלי לחתימה - זה לוקח דקה בטלפון. אחרי החתימה נבקש כמה מסמכים על הרכב ונחזור אליך עם תשובות.`,
    ];
  }
  return [
    `אז ככה${name}, אני אסביר איך זה עובד אצלנו בבינגו. אנחנו חברת תיווך אשראי שעובדת מול מספר גופי מימון מפוקחים - במקום שתתרוצץ בין גופים לבד, אנחנו מגישים את הבקשה עבורך לכמה גופים במקביל.`,
    `ככה בודקים איפה אפשר לקבל את התנאים הטובים ביותר בהתאם לנתונים שלך, בלי שזה פוגע לך בזמן או בכיס.`,
    `חשוב לי להדגיש - הבדיקה עצמה לא עולה כסף ולא מחייבת אותך בכלום. שכר הטרחה שלנו נגבה רק אם ההלוואה מתקבלת בפועל, ורק אחרי שקיבלת אותה.`,
    `כדי שנוכל להתחיל בבדיקה, אני שולח לך עכשיו הסכם התקשרות דיגיטלי לחתימה - זה לוקח דקה בטלפון. אחרי החתימה נריץ את הבדיקות ונחזור אליך עם תשובות.`,
  ];
}

const STATUS_LABEL: Record<string, string> = {
  sent: "נשלח ללקוח",
  viewed: "הלקוח פתח",
  signed: "נחתם",
};

export function Step6Agreement({ state, agreement, vehicleTrack }: {
  state: ClassicCardState;
  agreement: AgreementApi;
  vehicleTrack: boolean;
}) {
  const firstName = str(state.values.firstName) || state.lead.fullName.split(" ")[0] || "";
  const paragraphs = scriptFor(vehicleTrack, firstName);
  const form = agreement.agreementForm;

  return (
    <div className="space-y-5">
      {/* כרטיס הקריאה */}
      <div className="rounded-[16px] bg-bingo-gray-50 p-6">
        <p className="text-[12px] font-semibold text-bingo-gray-500 mb-3">
          תסריט שיחה · {vehicleTrack ? "מסלול רכב" : "מסלול כל מטרה"}
        </p>
        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[17px] leading-[1.7] text-bingo-black">{p}</p>
          ))}
        </div>
      </div>

      {/* בלוק ההסכם */}
      <div className="rounded-[16px] border border-bingo-gray-150 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-bingo-gray-100 text-bingo-gray-600 flex items-center justify-center shrink-0">
            <FileSignature size={17} strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-bingo-black">הסכם התקשרות</p>
            <p className="text-[12px] text-bingo-gray-500 truncate">{agreement.templateName}</p>
          </div>

          {form ? (
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
                form.status === "signed"
                  ? "bg-bingo-green-light text-bingo-green-deep"
                  : "b-chip-gray"
              }`}>
                {form.status === "signed"
                  ? <Check size={14} strokeWidth={2} />
                  : <Clock3 size={14} strokeWidth={1.75} />}
                {STATUS_LABEL[form.status] ?? form.status}
              </span>
              {form.status !== "signed" && (
                <button
                  type="button"
                  onClick={() => void agreement.markSigned(form.id)}
                  className="b-pill-ghost min-h-[44px] px-4 text-[13px]"
                >
                  סמן כנחתם
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void agreement.sendAgreement()}
              disabled={agreement.sending}
              className="b-pill-green min-h-[44px] px-6 text-[14px] font-bold disabled:opacity-50"
            >
              {agreement.sending ? "שולח" : "שלח הסכם התקשרות"}
            </button>
          )}
        </div>

        {form && form.status !== "signed" && (
          <p className="text-[12px] text-bingo-gray-500 mt-3">
            הסטטוס מתעדכן אוטומטית כל כמה שניות - אפשר להמשיך בשיחה בינתיים
          </p>
        )}
      </div>

      {/* ערוצי פנייה */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void agreement.openWhatsApp()}
          disabled={!agreement.hasPhone}
          title={agreement.hasPhone ? undefined : "אין מספר טלפון בכרטיס"}
          className="b-pill-ghost min-h-[44px] px-5 text-[13px] font-semibold flex items-center gap-2 disabled:opacity-40"
        >
          <MessageCircle size={16} strokeWidth={1.75} /> וואטסאפ ללקוח
        </button>
        <button
          type="button"
          onClick={() => agreement.openEmail()}
          disabled={!agreement.hasEmail}
          title={agreement.hasEmail ? undefined : "אין כתובת מייל בכרטיס"}
          className="b-pill-ghost min-h-[44px] px-5 text-[13px] font-semibold flex items-center gap-2 disabled:opacity-40"
        >
          <Mail size={16} strokeWidth={1.75} /> מייל ללקוח
        </button>
      </div>
    </div>
  );
}
