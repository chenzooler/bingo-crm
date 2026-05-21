export interface Level {
  level: number;
  title: string;
  emoji: string;
  xpRequired: number;
  perks: string[];
}

export const LEVELS: Level[] = [
  { level: 1, title: "מתחיל", emoji: "🌱", xpRequired: 0, perks: ["גישה בסיסית"] },
  { level: 2, title: "סוכן", emoji: "💼", xpRequired: 500, perks: ["+5% עמלה"] },
  { level: 3, title: "מקצוען", emoji: "⭐", xpRequired: 1500, perks: ["דשבורד מותאם"] },
  { level: 4, title: "מומחה", emoji: "🎯", xpRequired: 3500, perks: ["AI Co-pilot מתקדם"] },
  { level: 5, title: "אמן", emoji: "🏆", xpRequired: 7000, perks: ["ראשון בתור לידים חמים"] },
  { level: 6, title: "אגדה", emoji: "👑", xpRequired: 12000, perks: ["סטטוס VIP בצוות"] },
  { level: 7, title: "מאסטר בינגו", emoji: "🔥", xpRequired: 20000, perks: ["הכל פתוח"] },
];

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; target: number };
}

export const BADGES: Badge[] = [
  { id: "first-deal", name: "הסגירה הראשונה", description: "סגרת את העסקה הראשונה שלך", emoji: "🎉", rarity: "common", unlocked: true, unlockedAt: "2025-09-15" },
  { id: "ten-deals", name: "מועדון ה-10", description: "10 עסקאות בחודש", emoji: "🔟", rarity: "common", unlocked: true, unlockedAt: "2025-11-02" },
  { id: "hot-week", name: "שבוע לוהט", description: "5 ימים רצופים של 2+ עסקאות", emoji: "🔥", rarity: "rare", unlocked: true, unlockedAt: "2026-01-20" },
  { id: "ai-believer", name: "מאמין ב-AI", description: "השתמשת ב-AI Co-pilot 100 פעם", emoji: "🤖", rarity: "rare", unlocked: true, unlockedAt: "2026-02-08" },
  { id: "big-fish", name: "דג גדול", description: "סגרת עסקה מעל ₪500K", emoji: "🐋", rarity: "epic", unlocked: false, progress: { current: 380000, target: 500000 } },
  { id: "perfectionist", name: "פרפקציוניסט", description: "ציון איכות שיחה 100% בשבוע", emoji: "💎", rarity: "epic", unlocked: false, progress: { current: 87, target: 100 } },
  { id: "month-king", name: "מלך החודש", description: "מקום 1 במצטיינים", emoji: "👑", rarity: "legendary", unlocked: false, progress: { current: 12, target: 15 } },
  { id: "ghostbuster", name: "צייד רוחות", description: "החזרת לחיים 50 לידים מתים", emoji: "👻", rarity: "rare", unlocked: false, progress: { current: 31, target: 50 } },
  { id: "speed-demon", name: "ברק", description: "זמן תגובה ממוצע מתחת ל-2 דק'", emoji: "⚡", rarity: "rare", unlocked: false, progress: { current: 3.2, target: 2 } },
];

export const RARITY_META = {
  common: { label: "רגיל", color: "text-bingo-gray-600", bg: "bg-bingo-gray-100 border-bingo-gray-200" },
  rare: { label: "נדיר", color: "text-status-blue", bg: "bg-status-blue/10 border-status-blue/30" },
  epic: { label: "אפי", color: "text-status-purple", bg: "bg-status-purple/10 border-status-purple/30" },
  legendary: { label: "אגדי", color: "text-amber-700", bg: "bg-gradient-to-bl from-amber-100 to-yellow-50 border-amber-300" },
};

/** Current player state — mocked for chen */
export const PLAYER = {
  name: "חן צולר",
  level: 4,
  xp: 4280,
  xpThisWeek: 320,
  todayActivity: [
    { action: "סגירת עסקה", xp: 100, time: "09:34" },
    { action: "שיחה איכותית", xp: 25, time: "10:12" },
    { action: "שימוש ב-AI Co-pilot", xp: 10, time: "10:45" },
    { action: "מעקב WhatsApp", xp: 15, time: "11:20" },
    { action: "סגירת עסקה", xp: 100, time: "14:08" },
    { action: "תייגת ליד חם", xp: 5, time: "15:32" },
    { action: "עדכון שאלון מלא", xp: 30, time: "16:15" },
  ],
};

export function getCurrentLevel(xp: number): Level {
  return [...LEVELS].reverse().find((l) => xp >= l.xpRequired) || LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  return LEVELS.find((l) => l.xpRequired > xp) || null;
}

export function getLevelProgress(xp: number) {
  const current = getCurrentLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return { pct: 100, into: 0, span: 0 };
  const span = next.xpRequired - current.xpRequired;
  const into = xp - current.xpRequired;
  return { pct: (into / span) * 100, into, span };
}
