// Seed: real Yoatsim users (externalId = Yoatsim user id) + funding bodies
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });

const USERS = [
  { externalId: "12251", name: "אריאל פרגן", role: "agent" },
  { externalId: "12266", name: "אסתר צולר", emoji: "💼", role: "owner" },
  { externalId: "12394", name: "חן צולר", emoji: "💼", role: "owner", email: "chen@bingoisrael.co.il" },
  { externalId: "12533", name: "עמנואל פרגן", emoji: "💸", role: "agent" },
  { externalId: "12688", name: "רועי גוזלן", emoji: "💸", role: "agent" },
  { externalId: "13506", name: "מגי ארגאו", role: "underwriter" },
  { externalId: "13508", name: "רותם טופז", role: "underwriter" },
  { externalId: "13683", name: "יוסף אברהם", emoji: "👨‍💼", role: "manager" },
  { externalId: "13897", name: "תותח שיחות", role: "bot" },
  { externalId: "13986", name: "יוני קיטל", emoji: "👨‍💼", role: "manager" },
  { externalId: "14053", name: "WOKI", emoji: "🗳️", role: "bot" },
  { externalId: "14069", name: "אלעד ברומר", emoji: "📝", role: "underwriter" },
  { externalId: "14117", name: "ניסן מליחי", emoji: "👨‍💼", role: "manager" },
  { externalId: "14308", name: "בר סולטן", emoji: "📝", role: "underwriter" },
  { externalId: "14367", name: "יובל יקיר", emoji: "📝", role: "underwriter" },
  { externalId: "14369", name: "חנה פינטו", emoji: "📝", role: "underwriter" },
  { externalId: "14543", name: "דודו ווקנין", emoji: "📝", role: "underwriter" },
  { externalId: "14620", name: "מנדי שיווק", role: "marketing" },
  { externalId: "14656", name: "דניאל רחמים", emoji: "📝", role: "underwriter" },
  { externalId: "14657", name: "גל לוי", emoji: "📝", role: "underwriter" },
  { externalId: "14658", name: "דנה אדרי", emoji: "📝", role: "underwriter" },
  { externalId: "14671", name: "ליה מיזלס", emoji: "📝", role: "underwriter" },
  { externalId: "14672", name: "שי צברי", emoji: "📝", role: "underwriter" },
  { externalId: "14673", name: "טום גליקין", emoji: "📝", role: "underwriter" },
  { externalId: "14686", name: "יהודית עצור", emoji: "📝", role: "underwriter" },
  { externalId: "14687", name: "דניאל דוד יוסף", emoji: "📝", role: "underwriter" },
];

// botSupported = the Chrome extension knows how to fill their forms
const LENDERS = [
  { key: "jerusalem", name: "בנק ירושלים",  type: "bank",        botSupported: true },
  { key: "phoenix",   name: "פניקס",         type: "insurance",   botSupported: true },
  { key: "isracard",  name: "ישראכרט",       type: "credit-card", botSupported: true },
  { key: "cal",       name: "כאל",           type: "credit-card", botSupported: true },
  { key: "max",       name: "MAX",           type: "credit-card", botSupported: true },
  { key: "leumi",     name: "לאומי",         type: "bank",        botSupported: false },
  { key: "hapoalim",  name: "הפועלים",       type: "bank",        botSupported: false },
  { key: "discount",  name: "דיסקונט",       type: "bank",        botSupported: false },
  { key: "mizrahi",   name: "מזרחי טפחות",   type: "bank",        botSupported: false },
  { key: "mimun-yashir", name: "מימון ישיר", type: "private",     botSupported: false },
  { key: "esh",       name: "אש ישראל",      type: "private",     botSupported: false },
  { key: "shotef",    name: "שוטף+",         type: "private",     botSupported: false },
];

async function main() {
  for (const u of USERS) {
    await db.user.upsert({
      where: { externalId: u.externalId },
      update: { name: u.name, role: u.role, emoji: u.emoji ?? null, email: (u as any).email ?? null },
      create: u,
    });
  }
  for (const l of LENDERS) {
    await db.lender.upsert({
      where: { key: l.key },
      update: { name: l.name, type: l.type, botSupported: l.botSupported },
      create: l,
    });
  }
  const users = await db.user.count();
  const lenders = await db.lender.count();
  console.log(`Seeded: ${users} users, ${lenders} lenders`);
}

main().finally(() => db.$disconnect());
