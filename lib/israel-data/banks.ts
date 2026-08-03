// בנקים וסניפים בישראל - רשימת הסניפים של בנק ישראל (data.gov.il resource 2202bada-4baf-45f5-aa61-8c5bad9646d3).
// branches.json בפורמט קומפקטי: [bankCode, branchCode, branchName, city, address][].
import rawBranches from "./data/branches.json";
import { MAX_RESULTS } from "./search";

export interface Bank {
  code: number;
  name: string;
  logoKey: string;
}

export interface Branch {
  bankCode: number;
  code: number;
  name: string;
  city: string;
  address: string;
  /** "675 כפר יונה" */
  label: string;
}

// רשימה קנונית - סדר לפי נפוצות. logoKey תואם public/logos/banks/<logoKey>.(svg|png).
export const BANKS: Bank[] = [
  { code: 12, name: "בנק הפועלים", logoKey: "hapoalim" },
  { code: 10, name: "בנק לאומי", logoKey: "leumi" },
  { code: 11, name: "בנק דיסקונט", logoKey: "discount" },
  { code: 20, name: "בנק מזרחי טפחות", logoKey: "mizrahi-tefahot" },
  { code: 31, name: "הבנק הבינלאומי", logoKey: "fibi" },
  { code: 17, name: "בנק מרכנתיל דיסקונט", logoKey: "mercantile" },
  { code: 54, name: "בנק ירושלים", logoKey: "jerusalem" },
  { code: 4, name: "בנק יהב", logoKey: "yahav" },
  { code: 46, name: "בנק מסד", logoKey: "massad" },
  { code: 52, name: "בנק פאגי", logoKey: "pagi" },
  { code: 14, name: "בנק אוצר החייל", logoKey: "otsar-hahayal" },
  { code: 18, name: "וואן זירו", logoKey: "onezero" },
  { code: 9, name: "בנק הדואר", logoKey: "postal" },
];

export function bankByCode(code: number): Bank | undefined {
  return BANKS.find((b) => b.code === code);
}

let branchCache: Map<number, Branch[]> | null = null;

function branchesMap(): Map<number, Branch[]> {
  if (!branchCache) {
    branchCache = new Map();
    for (const [bankCode, code, name, city, address] of rawBranches as unknown as [
      number,
      number,
      string,
      string,
      string,
    ][]) {
      const branch: Branch = { bankCode, code, name, city, address, label: `${code} ${name}` };
      const list = branchCache.get(bankCode);
      if (list) list.push(branch);
      else branchCache.set(bankCode, [branch]);
    }
  }
  return branchCache;
}

export function branchesOfBank(bankCode: number): Branch[] {
  return branchesMap().get(bankCode) ?? [];
}

/** q תואם תחילית של מספר סניף, או "מכיל" בשם/עיר. תחיליות קוד קודם. */
export function searchBranches(bankCode: number, q: string): Branch[] {
  const branches = branchesOfBank(bankCode);
  const query = q.trim();
  if (!query) return branches.slice(0, MAX_RESULTS);
  const codePrefix: Branch[] = [];
  const contains: Branch[] = [];
  for (const b of branches) {
    if (String(b.code).startsWith(query)) {
      codePrefix.push(b);
    } else if (b.name.includes(query) || b.city.includes(query)) {
      contains.push(b);
    }
  }
  return [...codePrefix, ...contains].slice(0, MAX_RESULTS);
}
