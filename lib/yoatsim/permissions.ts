/**
 * שכפול Yoatsim 1:1 — 9 רמות ההרשאה ומטריצת ההרשאות.
 * מקור: docs/yoatsim-full-spec.md §5. מטריצה זהה לכל תפקיד — משתנים רק הערכים.
 * הדוגמאות המתועדות (מנהל ראשי, יועצי אשראי) שוחזרו מילה במילה; שאר התפקידים
 * לפי ההיגיון העסקי המתועד — ניתנים לעריכה במסך ניהול המשתמשים.
 */

export type CardAccess = "none" | "view" | "edit" | "add-edit" | "add-edit-delete";
export type CardScope = "all" | "assigned" | "assigned-unassigned";

export interface PermissionProfile {
  key: string;
  name: string; // השם המדויק מ-Yoatsim
  cards: {
    access: CardAccess;
    scope: CardScope;
    countOnlyAssigned: boolean; // ספירה במסך ראשי רק משוייכים
    releaseLocked: boolean;     // שחרור כרטיס נעול
    updateResponsible: boolean; // עדכון "יוזר אחראי"
  };
  contacts: {
    access: CardAccess;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  tasks: {
    access: CardAccess;
    onlyOwn: boolean;      // "רק של היוזר"
    allCalls: boolean;     // כל השיחות
    allWhatsapp: boolean;  // כל הווטסאפ
    blockDone: boolean;    // חסימת "בוצע"
    privacy: boolean;      // פרטיות
  };
  accountingDocs: CardAccess;
  forms: CardAccess;
  files: CardAccess;
  userSettings: boolean;   // הגדרות משתמשים
  broadcast: boolean;      // הודעות מתפרצות
  settingsScreens: boolean; // מסכי הגדרות
  advancedSearch: boolean;
  reports: {
    allClients: boolean;   // דוחות (על כל הלקוחות)
    hiddenReports: string[]; // "ניתן להסתיר דוח ספציפי"
  };
  activityHours: {
    emailAlert: boolean;       // התראה למייל
    blockOutsideHours: boolean; // חסימה מחוץ לשעות
  };
}

const FULL_CARDS = {
  access: "add-edit-delete" as CardAccess,
  scope: "all" as CardScope,
  countOnlyAssigned: false,
  releaseLocked: true,
  updateResponsible: true,
};

export const PERMISSION_PROFILES: PermissionProfile[] = [
  {
    key: "main-manager",
    name: "מנהל ראשי",
    // מהאפיון: גישה מלאה (הוספה/עריכה/מחיקה) לכל הכרטיסים + מייל/סמס/ווטסאפ מלא
    cards: { ...FULL_CARDS },
    contacts: { access: "add-edit-delete", email: true, sms: true, whatsapp: true },
    tasks: { access: "add-edit-delete", onlyOwn: false, allCalls: true, allWhatsapp: true, blockDone: false, privacy: false },
    accountingDocs: "add-edit-delete",
    forms: "add-edit-delete",
    files: "add-edit-delete",
    userSettings: true,
    broadcast: true,
    settingsScreens: true,
    advancedSearch: true,
    reports: { allClients: true, hiddenReports: [] },
    activityHours: { emailAlert: false, blockOutsideHours: false },
  },
  {
    key: "floor-manager",
    name: "מנהל מוקד",
    cards: { access: "add-edit-delete", scope: "all", countOnlyAssigned: false, releaseLocked: true, updateResponsible: true },
    contacts: { access: "add-edit", email: true, sms: true, whatsapp: true },
    tasks: { access: "add-edit-delete", onlyOwn: false, allCalls: true, allWhatsapp: true, blockDone: false, privacy: false },
    accountingDocs: "view",
    forms: "add-edit",
    files: "add-edit",
    userSettings: false,
    broadcast: true,
    settingsScreens: false,
    advancedSearch: true,
    reports: { allClients: true, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: false },
  },
  {
    key: "floor-manager-rotem",
    name: "מנהל מוקד-רותם",
    cards: { access: "add-edit", scope: "all", countOnlyAssigned: false, releaseLocked: true, updateResponsible: true },
    contacts: { access: "add-edit", email: false, sms: true, whatsapp: true },
    tasks: { access: "add-edit", onlyOwn: false, allCalls: true, allWhatsapp: true, blockDone: false, privacy: false },
    accountingDocs: "view",
    forms: "add-edit",
    files: "add-edit",
    userSettings: false,
    broadcast: true,
    settingsScreens: false,
    advancedSearch: true,
    reports: { allClients: true, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: false },
  },
  {
    key: "credit-advisors",
    name: "יועצי אשראי",
    // מהאפיון: הוספה/עריכה בלבד (ללא מחיקה) · רואה הכל אך ספירה רק משוייכים ·
    // מייל כבוי (רק סמס/ווטסאפ) · משימות "רק של היוזר" · ללא "כל השיחות"
    cards: { access: "add-edit", scope: "all", countOnlyAssigned: true, releaseLocked: false, updateResponsible: true },
    contacts: { access: "add-edit", email: false, sms: true, whatsapp: true },
    tasks: { access: "add-edit", onlyOwn: true, allCalls: false, allWhatsapp: false, blockDone: false, privacy: false },
    accountingDocs: "none",
    forms: "add-edit",
    files: "add-edit",
    userSettings: false,
    broadcast: false,
    settingsScreens: false,
    advancedSearch: true,
    reports: { allClients: false, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: true },
  },
  {
    key: "credit-advisors-manager",
    name: "יועצי אשראי מנהל",
    cards: { access: "add-edit", scope: "all", countOnlyAssigned: false, releaseLocked: true, updateResponsible: true },
    contacts: { access: "add-edit", email: false, sms: true, whatsapp: true },
    tasks: { access: "add-edit", onlyOwn: false, allCalls: true, allWhatsapp: true, blockDone: false, privacy: false },
    accountingDocs: "view",
    forms: "add-edit",
    files: "add-edit",
    userSettings: false,
    broadcast: false,
    settingsScreens: false,
    advancedSearch: true,
    reports: { allClients: true, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: false },
  },
  {
    key: "mortgages",
    name: "משכנתאות",
    cards: { access: "add-edit", scope: "assigned-unassigned", countOnlyAssigned: true, releaseLocked: false, updateResponsible: false },
    contacts: { access: "add-edit", email: true, sms: true, whatsapp: true },
    tasks: { access: "add-edit", onlyOwn: true, allCalls: false, allWhatsapp: false, blockDone: false, privacy: false },
    accountingDocs: "none",
    forms: "add-edit",
    files: "add-edit",
    userSettings: false,
    broadcast: false,
    settingsScreens: false,
    advancedSearch: true,
    reports: { allClients: false, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: true },
  },
  {
    key: "marketing",
    name: "שיווק",
    cards: { access: "view", scope: "all", countOnlyAssigned: false, releaseLocked: false, updateResponsible: false },
    contacts: { access: "view", email: true, sms: true, whatsapp: true },
    tasks: { access: "view", onlyOwn: true, allCalls: false, allWhatsapp: true, blockDone: true, privacy: false },
    accountingDocs: "none",
    forms: "view",
    files: "view",
    userSettings: false,
    broadcast: true,
    settingsScreens: false,
    advancedSearch: true,
    reports: { allClients: true, hiddenReports: [] },
    activityHours: { emailAlert: false, blockOutsideHours: false },
  },
  {
    key: "retention-yoni",
    name: "שימורים-יוני",
    cards: { access: "add-edit", scope: "assigned", countOnlyAssigned: true, releaseLocked: false, updateResponsible: false },
    contacts: { access: "add-edit", email: false, sms: true, whatsapp: true },
    tasks: { access: "add-edit", onlyOwn: true, allCalls: false, allWhatsapp: false, blockDone: false, privacy: false },
    accountingDocs: "none",
    forms: "add-edit",
    files: "add-edit",
    userSettings: false,
    broadcast: false,
    settingsScreens: false,
    advancedSearch: false,
    reports: { allClients: false, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: true },
  },
  {
    key: "dialer",
    name: "תותח שיחות",
    cards: { access: "edit", scope: "assigned", countOnlyAssigned: true, releaseLocked: false, updateResponsible: false },
    contacts: { access: "view", email: false, sms: true, whatsapp: true },
    tasks: { access: "add-edit", onlyOwn: true, allCalls: false, allWhatsapp: false, blockDone: true, privacy: true },
    accountingDocs: "none",
    forms: "view",
    files: "view",
    userSettings: false,
    broadcast: false,
    settingsScreens: false,
    advancedSearch: false,
    reports: { allClients: false, hiddenReports: [] },
    activityHours: { emailAlert: true, blockOutsideHours: true },
  },
];

export const ACCESS_LABELS: Record<CardAccess, string> = {
  "none": "ללא גישה",
  "view": "צפייה",
  "edit": "עריכה",
  "add-edit": "הוספה ועריכה",
  "add-edit-delete": "הוספה, עריכה ומחיקה",
};

export const SCOPE_LABELS: Record<CardScope, string> = {
  "all": "כל הכרטיסים",
  "assigned": "משוייכים בלבד",
  "assigned-unassigned": "משוייכים + ללא שיוך",
};

export function profileByKey(key: string): PermissionProfile | undefined {
  return PERMISSION_PROFILES.find((p) => p.key === key);
}

export function profileByName(name: string): PermissionProfile | undefined {
  return PERMISSION_PROFILES.find((p) => p.name === name);
}
