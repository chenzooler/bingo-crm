// חברות ביטוח, פנסיה ובתי השקעות בישראל - רשימה קנונית עם לוגואים.
// logoKey תואם public/logos/insurers/<logoKey>.(svg|png).

export interface Insurer {
  key: string;
  name: string;
  /** נתיב ציבורי ללוגו, כולל סיומת אמיתית */
  logo: string;
}

export const INSURERS: Insurer[] = [
  { key: "phoenix", name: "הפניקס", logo: "/logos/insurers/phoenix.svg" },
  { key: "harel", name: "הראל", logo: "/logos/insurers/harel.png" },
  { key: "migdal", name: "מגדל", logo: "/logos/insurers/migdal.svg" },
  { key: "clal", name: "כלל ביטוח", logo: "/logos/insurers/clal.svg" },
  { key: "menora", name: "מנורה מבטחים", logo: "/logos/insurers/menora.svg" },
  { key: "meitav", name: "מיטב", logo: "/logos/insurers/meitav.svg" },
  { key: "altshuler", name: "אלטשולר שחם", logo: "/logos/insurers/altshuler.png" },
  { key: "more", name: "מור", logo: "/logos/insurers/more.svg" },
  { key: "analyst", name: "אנליסט", logo: "/logos/insurers/analyst.svg" },
  { key: "yelin", name: "ילין לפידות", logo: "/logos/insurers/yelin.svg" },
  { key: "infinity", name: "אינפיניטי", logo: "/logos/insurers/infinity.svg" },
];

export function insurerByKey(key: string): Insurer | undefined {
  return INSURERS.find((i) => i.key === key);
}
