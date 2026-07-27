// Voicenter telephony integration — server-side only (reads VOICENTER_CODE from env).
// Click2Call + terminate + GetExtensions. אין לוגים של הקוד, אין hardcode.

const CLICK2CALL_URL = "https://api.voicenter.com/ForwardDialer/click2call.aspx";
const EXTENSIONS_URL = "https://monitor.voicenter.co.il/Comet/api/GetExtensions";

export function getVoicenterCode(): string {
  const code = process.env.VOICENTER_CODE;
  if (!code) {
    throw new Error(
      "VOICENTER_CODE חסר בקובץ .env.local - הוסף את קוד ה-API של Voicenter והפעל מחדש את השרת",
    );
  }
  return code;
}

/** נירמול טלפון לפורמט ישראלי 0XXXXXXXXX: ספרות בלבד, 972 → 0. */
export function normalizePhone(raw: string): string {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("00972")) digits = "0" + digits.slice(5);
  else if (digits.startsWith("972")) digits = "0" + digits.slice(3);
  return digits;
}

/** האם target נראה כמו שלוחת SIP (מזהה אלפאנומרי) ולא מספר טלפון */
function isSipId(value: string): boolean {
  return /[a-zA-Z]/.test(value);
}

const ERROR_MESSAGES: Record<number, string> = {
  1: "פרמטרים לא תקינים בבקשת החיוג",
  2: "שגיאת מערכת ב-Voicenter - נסה שוב בעוד רגע",
  3: "השלוחה לא מחוברת - התחבר לשלוחה שלך ב-Voicenter",
  4: "המספר חסום לחיוג",
};

export interface Click2CallResult {
  ok: boolean;
  callId?: string;
  error?: string;
  errorCode?: number;
}

/** בניית גוף הבקשה ל-Click2Call — מופרד לצורך בדיקות יחידה (בלי שיחה אמיתית). */
export function buildClick2CallBody(params: {
  code: string;
  extension: string;
  target: string;
  vars?: Record<string, string | number>;
}): Record<string, string> {
  const body: Record<string, string> = {
    code: params.code,
    action: "call",
    phone: isSipId(params.extension) ? params.extension : normalizePhone(params.extension),
    target: normalizePhone(params.target),
    record: "true",
    format: "json",
    checkphonedevicestate: "true",
  };
  for (const [k, v] of Object.entries(params.vars ?? {})) {
    // Voicenter מהדהד עד 10 פרמטרי var_* בחזרה ב-CDR
    body[k.startsWith("var_") ? k : `var_${k}`] = String(v);
  }
  return body;
}

export async function click2call(params: {
  extension: string;
  target: string;
  vars?: Record<string, string | number>;
}): Promise<Click2CallResult> {
  const code = getVoicenterCode();
  const body = buildClick2CallBody({ code, ...params });
  try {
    const res = await fetch(CLICK2CALL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as
      | { ERRORCODE?: number; ERRORMESSAGE?: string; CALLID?: string }
      | null;
    if (!data) return { ok: false, error: "תשובה לא תקינה מ-Voicenter" };
    const errorCode = Number(data.ERRORCODE ?? -1);
    if (errorCode === 0 && data.CALLID) {
      return { ok: true, callId: String(data.CALLID) };
    }
    return {
      ok: false,
      errorCode,
      error: ERROR_MESSAGES[errorCode] ?? `שגיאת Voicenter (${errorCode}): ${data.ERRORMESSAGE ?? ""}`,
    };
  } catch {
    return { ok: false, error: "אין תקשורת עם Voicenter - בדוק חיבור לאינטרנט" };
  }
}

/** ניתוק שיחה פעילה של שלוחה */
export async function terminateCall(extension: string): Promise<{ ok: boolean; error?: string }> {
  const code = getVoicenterCode();
  try {
    const res = await fetch(CLICK2CALL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "terminate", phone: extension, format: "json" }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as { ERRORCODE?: number } | null;
    if (data && Number(data.ERRORCODE) === 0) return { ok: true };
    return { ok: false, error: "הניתוק נכשל" };
  } catch {
    return { ok: false, error: "אין תקשורת עם Voicenter" };
  }
}

export interface VoicenterExtension {
  name: string;
  sip: string;
  phoneLabel: string;
}

/** רשימת השלוחות בחשבון — Name בפורמט "Admin User - 0539625513" */
export async function getExtensions(): Promise<VoicenterExtension[]> {
  const code = getVoicenterCode();
  const url = `${EXTENSIONS_URL}?code=${encodeURIComponent(code)}&showAll=1`;
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as
    | { ERR?: number; EXTENSIONS?: Array<{ Name?: string; SIP?: string }> }
    | null;
  if (!data || Number(data.ERR) !== 0 || !Array.isArray(data.EXTENSIONS)) {
    throw new Error("Voicenter החזיר תשובה לא תקינה לרשימת השלוחות");
  }
  return data.EXTENSIONS.filter((e) => e.SIP).map((e) => {
    const name = String(e.Name ?? "");
    const m = name.match(/-\s*(0?\d{8,10})\s*$/);
    return {
      name,
      sip: String(e.SIP),
      phoneLabel: m ? normalizePhone(m[1]) : "",
    };
  });
}

/** תרגום סטטוס CDR של Voicenter לעברית */
export const CALL_STATUS_HEBREW: Record<string, string> = {
  ANSWER: "נענתה",
  BUSY: "תפוס",
  NOANSWER: "אין מענה",
  CANCEL: "בוטלה",
  ABANDONE: "ננטשה",
  VOEND: "הסתיימה במערכת",
  TE: "שגיאה טכנית",
  NOTCALLED: "לא חויגה",
  VOICEMAIL: "תא קולי",
  dialing: "בחיוג",
  error: "שגיאה",
};

export function callStatusHebrew(status: string): string {
  return CALL_STATUS_HEBREW[status] ?? status;
}
