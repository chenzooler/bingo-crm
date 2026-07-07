// Seed: real Yoatsim users (externalId = Yoatsim user id) + funding bodies
// + שכפול Yoatsim 1:1: אוטומציות, תבניות הודעה, רמות הרשאה, משימות דמו
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { AUTOMATIONS } from "../lib/yoatsim/automations";
import { TEMPLATES } from "../lib/yoatsim/templates";

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

// role → אחת מ-9 רמות ההרשאה של Yoatsim (lib/yoatsim/permissions.ts)
const ROLE_TO_PERMISSION: Record<string, string> = {
  owner: "main-manager",
  manager: "floor-manager",
  agent: "credit-advisors",
  underwriter: "credit-advisors",
  marketing: "marketing",
  bot: "dialer",
};

async function main() {
  for (const u of USERS) {
    const permissionRole = ROLE_TO_PERMISSION[u.role] ?? "credit-advisors";
    await db.user.upsert({
      where: { externalId: u.externalId },
      update: { name: u.name, role: u.role, emoji: u.emoji ?? null, email: (u as any).email ?? null, permissionRole },
      create: { ...u, permissionRole },
    });
  }
  for (const l of LENDERS) {
    await db.lender.upsert({
      where: { key: l.key },
      update: { name: l.name, type: l.type, botSupported: l.botSupported },
      create: l,
    });
  }

  // שינויי-שם (החלטת חן 07/26: "סמיילי"→"רמזור") — לפני ה-upsert, כדי שמסדים
  // קיימים (כולל פרודקשן, שמריץ seed בעלייה) ישנו את השורה במקום ליצור כפילות
  const AUTOMATION_RENAMES: [string, string][] = [
    ["אישור לקוח-בדיקת סמיילי", "אישור לקוח-בדיקת רמזור"],
    ["סמיילי אדום", "רמזור אדום"],
  ];
  for (const [oldName, newName] of AUTOMATION_RENAMES) {
    await db.automation.updateMany({ where: { name: oldName }, data: { name: newName } });
  }

  // 21 האוטומציות — upsert לפי שם; עריכות של המשתמש ב-UI לא נדרסות (update רק בשדות בסיס)
  for (const a of AUTOMATIONS) {
    const data = {
      cardType: a.cardType,
      actionType: a.actionType,
      conditionsJson: JSON.stringify(a.conditions),
      actionsJson: JSON.stringify(a.actions),
    };
    await db.automation.upsert({
      where: { name: a.name },
      update: {}, // לא דורסים עריכות UI
      create: { name: a.name, enabled: a.enabled, ...data },
    });
  }

  // תבניות הודעה — upsert לפי שם
  for (const t of TEMPLATES) {
    await db.messageTemplate.upsert({
      where: { name: t.name },
      update: {}, // לא דורסים עריכות UI
      create: {
        name: t.name,
        channel: t.channel,
        sender: t.sender,
        body: t.body ?? null,
        watiJson: t.wati ? JSON.stringify(t.wati) : null,
      },
    });
  }

  // משימות דמו — כמו הדוגמאות החיות מהאודיט (רק אם אין משימות בכלל)
  if ((await db.task.count()) === 0) {
    const chen = await db.user.findUnique({ where: { externalId: "12394" } });
    const roi = await db.user.findUnique({ where: { externalId: "12688" } });
    const dani = await db.user.findUnique({ where: { externalId: "14656" } });
    const leads = await db.lead.findMany({ take: 3, orderBy: { id: "asc" } });
    if (chen && leads.length) {
      const yesterday = new Date(Date.now() - 26 * 3600_000);
      const tomorrow = new Date(Date.now() + 24 * 3600_000);
      await db.task.createMany({
        data: [
          { leadId: leads[0].id, fromUserId: chen.id, toUserId: dani?.id ?? chen.id, text: "לבדוק מול ישראכרט", dueAt: yesterday },
          { leadId: leads[1]?.id ?? leads[0].id, fromUserId: roi?.id ?? chen.id, toUserId: chen.id, text: "לא מוכר חסין", dueAt: yesterday },
          { leadId: leads[2]?.id ?? leads[0].id, fromUserId: chen.id, toUserId: chen.id, text: "לחזור ללקוח אחרי 16:00", dueAt: tomorrow, channel: "call" },
        ],
      });
    }
  }

  const users = await db.user.count();
  const lenders = await db.lender.count();
  const automations = await db.automation.count();
  const templates = await db.messageTemplate.count();
  const tasks = await db.task.count();
  console.log(`Seeded: ${users} users, ${lenders} lenders, ${automations} automations, ${templates} templates, ${tasks} tasks`);
}

main().finally(() => db.$disconnect());
