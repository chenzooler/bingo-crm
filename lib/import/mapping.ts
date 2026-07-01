/**
 * Yoatsim Import Engine — column auto-detection, normalization, validation.
 * "היום הנתונים לא כאלה נכונים אז חייב שהכל יהיה מדויק" — Chen.
 * Every row is validated + normalized before touching the DB.
 */
import { STATUSES } from "@/lib/data/static";
import { STATUS_TO_LIFECYCLE } from "@/lib/data/status-mapper";

// ============ Column dictionary — Hebrew Yoatsim headers → schema field ============
// Order matters: first match wins. Keys are normalized (trimmed, no punctuation).
const HEADER_DICT: Array<{ field: string; patterns: RegExp[] }> = [
  { field: "externalId",       patterns: [/^(מזהה|id|מס' ליד|מספר ליד|lead ?id)$/i] },
  { field: "fullName",         patterns: [/^(שם מלא|שם לקוח|לקוח|שם)$/i] },
  { field: "firstName",        patterns: [/^(שם פרטי|פרטי)$/i] },
  { field: "lastName",         patterns: [/^(שם משפחה|משפחה)$/i] },
  { field: "idNumber",         patterns: [/^(ת\.?ז\.?|תעודת זהות|ת"ז|מספר זהות|זהות)$/i] },
  { field: "phone",            patterns: [/^(טלפון נייד|נייד|טלפון|טל'|סלולרי|phone|mobile)$/i] },
  { field: "phone2",           patterns: [/^(טלפון נוסף|טלפון 2|טלפון בית)$/i] },
  { field: "email",            patterns: [/^(אימייל|מייל|דוא"ל|דואל|email)$/i] },
  { field: "birthDate",        patterns: [/^(תאריך לידה|ת\. לידה|לידה)$/i] },
  { field: "gender",           patterns: [/^(מין|מגדר)$/i] },
  { field: "maritalStatus",    patterns: [/^(מצב משפחתי|משפחתי)$/i] },
  { field: "city",             patterns: [/^(עיר|ישוב|יישוב|עיר מגורים)$/i] },
  { field: "address",          patterns: [/^(כתובת|רחוב)$/i] },
  { field: "zip",              patterns: [/^(מיקוד)$/i] },
  { field: "employmentStatus", patterns: [/^(סטטוס תעסוקתי|תעסוקה|מעמד תעסוקתי|עיסוק)$/i] },
  { field: "employerName",     patterns: [/^(שם מעסיק|מעסיק|מקום עבודה)$/i] },
  { field: "monthlyIncome",    patterns: [/^(הכנסה חודשית|הכנסה|שכר|משכורת|הכנסה נטו)$/i] },
  { field: "seniorityMonths",  patterns: [/^(ותק|ותק בחודשים|ותק בעבודה)$/i] },
  { field: "spouseIncome",     patterns: [/^(הכנסת בן זוג|הכנסת בת זוג|הכנסת בן\/בת זוג)$/i] },
  { field: "numberOfChildren", patterns: [/^(ילדים|מספר ילדים|ילדים מתחת 18)$/i] },
  { field: "bankName",         patterns: [/^(בנק|שם בנק)$/i] },
  { field: "bankBranch",       patterns: [/^(סניף|מספר סניף)$/i] },
  { field: "bankAccount",      patterns: [/^(חשבון|מספר חשבון)$/i] },
  { field: "amountRequested",  patterns: [/^(סכום מבוקש|סכום הלוואה|סכום|הלוואה מבוקשת)$/i] },
  { field: "loanPurpose",      patterns: [/^(מטרת הלוואה|מטרה|מטרת ההלוואה)$/i] },
  { field: "monthlyObligations", patterns: [/^(החזרים חודשיים|התחייבויות|החזר חודשי קיים)$/i] },
  { field: "statusLabel",      patterns: [/^(סטטוס|status)$/i] },
  { field: "pipelineLabel",    patterns: [/^(תהליך|משפך|פייפליין|מחלקה|pipeline)$/i] },
  { field: "ownerName",        patterns: [/^(נציג|בעלים|מטפל|אחראי|נציג מטפל|יועץ)$/i] },
  { field: "providerName",     patterns: [/^(ספק|ספק לידים|ספק ליד)$/i] },
  { field: "source",           patterns: [/^(מקור|מקור ליד|מקור הליד|ערוץ)$/i] },
  { field: "intakeDate",       patterns: [/^(תאריך קליטה|קל"ט|תאריך יצירה|נוצר בתאריך|נוצר|תאריך)$/i] },
  { field: "notes",            patterns: [/^(הערות|הערה|תיאור)$/i] },
];

function normHeader(h: string): string {
  return (h || "").trim().replace(/\s+/g, " ").replace(/[:*]/g, "");
}

/** Auto-map file headers to schema fields. Returns {header → field|null} */
export function autoMapHeaders(headers: string[]): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  const used = new Set<string>();
  for (const h of headers) {
    const n = normHeader(h);
    let matched: string | null = null;
    for (const { field, patterns } of HEADER_DICT) {
      if (used.has(field)) continue;
      if (patterns.some((p) => p.test(n))) { matched = field; break; }
    }
    if (matched) used.add(matched);
    map[h] = matched;
  }
  return map;
}

// ============ Normalizers ============
export function normalizePhone(raw: unknown): string | null {
  if (raw == null) return null;
  let s = String(raw).replace(/\D/g, "");
  if (!s) return null;
  if (s.startsWith("972")) s = "0" + s.slice(3);
  if (s.length === 9 && s.startsWith("5")) s = "0" + s; // Excel dropped leading 0
  if (/^05\d{8}$/.test(s)) return s;
  if (/^0[23489]\d{7}$/.test(s)) return s; // landline
  return null; // invalid — reported as error
}

export function isValidIsraeliId(raw: unknown): boolean {
  if (raw == null) return false;
  let id = String(raw).replace(/\D/g, "");
  if (!id || id.length > 9) return false;
  id = id.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let d = Number(id[i]) * ((i % 2) + 1);
    if (d > 9) d -= 9;
    sum += d;
  }
  return sum % 10 === 0;
}

export function normalizeId(raw: unknown): string | null {
  if (raw == null) return null;
  const id = String(raw).replace(/\D/g, "");
  if (!id) return null;
  return id.padStart(9, "0");
}

export function parseDate(raw: unknown): Date | null {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) return raw;
  const s = String(raw).trim();
  // Excel serial number
  if (/^\d{5}$/.test(s)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000);
    return isNaN(d.getTime()) ? null : d;
  }
  // DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY (Israeli format)
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const yr = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
    const d = new Date(yr, Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0));
    return isNaN(d.getTime()) ? null : d;
  }
  const iso = new Date(s);
  return isNaN(iso.getTime()) ? null : iso;
}

export function parseNumber(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
}

const GENDER_MAP: Record<string, string> = { "זכר": "male", "ז": "male", "נקבה": "female", "נ": "female", male: "male", female: "female" };
const MARITAL_MAP: Record<string, string> = {
  "נשוי": "married", "נשואה": "married", "רווק": "single", "רווקה": "single",
  "גרוש": "divorced", "גרושה": "divorced", "אלמן": "widowed", "אלמנה": "widowed",
  "ידוע בציבור": "common-law", "ידועה בציבור": "common-law",
};
const EMPLOYMENT_MAP: Record<string, string> = {
  "שכיר": "employee", "שכירה": "employee", "עצמאי": "self-employed", "עצמאית": "self-employed",
  "פנסיונר": "retired", "פנסיונרית": "retired", "גמלאי": "retired",
  "קצבה": "stipend", "לא עובד": "unemployed", "לא עובדת": "unemployed", "מובטל": "unemployed",
};

export function mapEnum(raw: unknown, dict: Record<string, string>): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return dict[s] || null;
}
export { GENDER_MAP, MARITAL_MAP, EMPLOYMENT_MAP };

/** Resolve a Hebrew Yoatsim status label → { statusKey, stage, category, exitReason } */
export function resolveStatus(label: unknown): { statusKey: string | null; stage: string; category: string | null; exitReason: string | null } {
  const fallback = { statusKey: null, stage: "NEW", category: null, exitReason: null };
  if (label == null) return fallback;
  const s = String(label).trim();
  if (!s) return fallback;
  const status = STATUSES.find((st) => st.label === s || st.label.includes(s) || s.includes(st.label));
  if (!status) return { ...fallback, statusKey: null };
  const m = STATUS_TO_LIFECYCLE[status.key];
  return {
    statusKey: status.key,
    stage: m?.stage || "NEW",
    category: (m?.category as string) || null,
    exitReason: (m?.exitReason as string) || null,
  };
}

// ============ Row → Lead transformation ============
export interface RowError { row: number; field: string; message: string; value?: string }

export interface TransformedLead {
  data: Record<string, unknown>;
  ownerName: string | null;
  providerName: string | null;
  notes: string | null;
  errors: RowError[];
  warnings: RowError[];
}

export function transformRow(row: Record<string, unknown>, mapping: Record<string, string | null>, rowIndex: number): TransformedLead {
  const get = (field: string): unknown => {
    const header = Object.keys(mapping).find((h) => mapping[h] === field);
    return header ? row[header] : undefined;
  };
  const errors: RowError[] = [];
  const warnings: RowError[] = [];

  // Name (required)
  let fullName = String(get("fullName") ?? "").trim();
  const firstName = String(get("firstName") ?? "").trim() || null;
  const lastName = String(get("lastName") ?? "").trim() || null;
  if (!fullName && (firstName || lastName)) fullName = [firstName, lastName].filter(Boolean).join(" ");
  if (!fullName) errors.push({ row: rowIndex, field: "fullName", message: "שם חסר" });

  // Phone
  const rawPhone = get("phone");
  const phone = normalizePhone(rawPhone);
  if (rawPhone && !phone) warnings.push({ row: rowIndex, field: "phone", message: "טלפון לא תקין", value: String(rawPhone) });

  // Israeli ID
  const rawId = get("idNumber");
  let idNumber: string | null = null;
  if (rawId != null && String(rawId).trim() !== "") {
    idNumber = normalizeId(rawId);
    if (idNumber && !isValidIsraeliId(idNumber)) {
      warnings.push({ row: rowIndex, field: "idNumber", message: "ת.ז לא עוברת ביקורת ספרת ביקורת", value: String(rawId) });
    }
  }

  const st = resolveStatus(get("statusLabel"));

  const data: Record<string, unknown> = {
    externalId: get("externalId") ? String(get("externalId")).trim() : null,
    fullName, firstName, lastName,
    idNumber,
    phone,
    phone2: normalizePhone(get("phone2")),
    email: String(get("email") ?? "").trim().toLowerCase() || null,
    birthDate: parseDate(get("birthDate")),
    gender: mapEnum(get("gender"), GENDER_MAP),
    maritalStatus: mapEnum(get("maritalStatus"), MARITAL_MAP),
    city: String(get("city") ?? "").trim() || null,
    address: String(get("address") ?? "").trim() || null,
    zip: String(get("zip") ?? "").trim() || null,
    employmentStatus: mapEnum(get("employmentStatus"), EMPLOYMENT_MAP),
    employerName: String(get("employerName") ?? "").trim() || null,
    monthlyIncome: parseNumber(get("monthlyIncome")),
    seniorityMonths: parseNumber(get("seniorityMonths")),
    spouseIncome: parseNumber(get("spouseIncome")),
    numberOfChildren: parseNumber(get("numberOfChildren")),
    bankName: String(get("bankName") ?? "").trim() || null,
    bankBranch: String(get("bankBranch") ?? "").trim() || null,
    bankAccount: String(get("bankAccount") ?? "").trim() || null,
    amountRequested: parseNumber(get("amountRequested")),
    loanPurpose: String(get("loanPurpose") ?? "").trim() || null,
    monthlyObligations: parseNumber(get("monthlyObligations")),
    statusKey: st.statusKey,
    stage: st.stage,
    category: st.category,
    exitReason: st.exitReason,
    source: String(get("source") ?? "").trim() || null,
    intakeDate: parseDate(get("intakeDate")) || undefined, // default now()
    syncSource: "import",
  };

  return {
    data,
    ownerName: String(get("ownerName") ?? "").trim() || null,
    providerName: String(get("providerName") ?? "").trim() || null,
    notes: String(get("notes") ?? "").trim() || null,
    errors,
    warnings,
  };
}
