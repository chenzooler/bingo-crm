/**
 * חברות הביטוח / בתי ההשקעות לקרנות פנסיה והשתלמות - מקור האמת ב-lib/israel-data
 * (לוגואים אמיתיים), בתוספת גופים שאין להם לוגו (LogoBadge נופל לאות פתיחה).
 */
import { INSURERS as CANONICAL } from "@/lib/israel-data/insurers";

export interface InsurerEntry {
  name: string;
  logo?: string;
}

export const INSURERS: InsurerEntry[] = [
  ...CANONICAL.map((i) => ({ name: i.name, logo: i.logo })),
  { name: "הכשרה" },
  { name: "איילון" },
];
