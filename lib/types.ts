// Bingo CRM — types & enums based on Yoatzim research

export type UserRole = "owner" | "manager" | "agent" | "underwriter" | "bot" | "marketing";

export interface User {
  id: number;
  name: string;
  emoji?: string;
  role: UserRole;
  avatar?: string;
}

export type Pipeline =
  | "underwriting"      // 📝 מחלקת החתמות
  | "irrelevant"        // 🚫 לא מעוניינים
  | "general-loan"      // 💸 הלוואה לכל מטרה
  | "vehicle"           // 🚗 מחלקת רכב
  | "retention-yoni"    // שימורים יוני
  | "archive"           // כל הלידים - לא רלוונטי
  | "wati"              // פרסום WATI
  | "spam"              // ספאם
  | "legal";            // טיפול משפטי

export interface PipelineDef {
  key: Pipeline;
  label: string;
  emoji: string;
  color: string;
  count: number;
}

export interface StatusDef {
  key: string;
  label: string;
  emoji: string;
  pipeline: Pipeline;
  color: "green" | "yellow" | "red" | "blue" | "orange" | "purple" | "pink" | "gray";
  count: number;
}

export type LeadSource =
  | "facebook"
  | "tiktok"
  | "google"
  | "landing-page"
  | "website"
  | "newsletter"
  | "referral-bank"
  | "phone"
  | "lead-providers"
  | "fax"
  | "wati"
  | "sms";

export interface SourceDef {
  key: LeadSource;
  label: string;
  color: string;
}

export type LoanPurpose =
  | "debt-cover"
  | "family-help"
  | "studies"
  | "vacation"
  | "event"
  | "business"
  | "renovation"
  | "housing"
  | "shopping"
  | "vehicle"
  | "health"
  | "other";

export type EmploymentStatus = "employee" | "self-employed" | "stipend" | "unemployed" | "retired";
export type FamilyStatus = "single" | "married" | "divorced" | "widowed" | "common-law";
export type CreditCardBrand = "isracard" | "cal" | "max" | "direct" | "none";
export type SmileyScore = "green" | "yellow" | "red";

export type CheckResult =
  | "approved-principal"
  | "approved-principal-needs-account"
  | "approved-final"
  | "rejected"
  | "not-checked"
  | "check-error"
  | "had-other-approval"
  | "got-other-approval";

export type CustomerInterest =
  | "yes-progress"
  | "yes-partial"
  | "not-interested"
  | "hesitating";

// Lender list
export const LENDERS = [
  { key: "isracard", label: "ישראכרט" },
  { key: "cal", label: "כאל" },
  { key: "max", label: "מקס" },
  { key: "phoenix", label: "הפניקס" },
  { key: "blender", label: "בלנדר" },
  { key: "jerusalem-bank", label: "בנק ירושלים" },
  { key: "pension", label: "קרן פנסיה / השתלמות" },
  { key: "other-bank", label: "בנק אחר" },
  { key: "personal-bank", label: "הבנק הפרטי שלי" },
  { key: "insurance", label: "חברת ביטוח" },
  { key: "fama", label: "פמה" },
  { key: "direct-finance", label: "מימון ישיר" },
] as const;

export interface LenderCheck {
  key: string;
  date?: string;
  result?: CheckResult;
  approvedAmount?: number;
  maxPayments?: number;
  interest?: number;
  monthlyPayment?: number;
  customerInterest?: CustomerInterest;
  reasonNotChecked?: string;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
}

export interface LeadProcess {
  pipeline: Pipeline;
  status: string;
  ownerId: number;
  startedAt: string;
}

export type ActivityType =
  | "status-change"
  | "note"
  | "call-out"
  | "call-in"
  | "whatsapp"
  | "sms"
  | "email"
  | "task"
  | "reminder"
  | "form-sign";

export interface Activity {
  id: string;
  type: ActivityType;
  authorId: number;
  text: string;
  date: string;
  durationSec?: number;
  recipientId?: number;
  payload?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: "male" | "female";
  intakeDate: string;
  // Sources can be multi
  sources: LeadSource[];
  sourcesText?: string;
  // Process / status
  processes: LeadProcess[];
  primaryPipeline: Pipeline;
  primaryStatus: string;
  ownerId: number;
  locked?: boolean;
  // Eligibility section
  amountRequested?: number;
  loanPurpose?: LoanPurpose;
  // Credit history
  hadEnforcement?: boolean | null;
  hadCreditIssues?: boolean | null;
  accountRestricted?: boolean | null;
  bdiCleanup?: boolean | null;
  creditCards?: CreditCardBrand[];
  cardLimit?: "above-5k" | "below-5k";
  preCheckedSources?: string[];
  notesEligibility?: string;
  // Personal
  smileyAuto?: SmileyScore;
  smileyManual?: SmileyScore;
  bdiApproved?: boolean;
  familyStatus?: FamilyStatus;
  childrenU18?: number;
  // Income
  employmentStatus?: EmploymentStatus;
  employmentTenure?: number;
  monthlyIncome?: number;
  spouseIncome?: number;
  additionalIncome?: number;
  // Assets
  hasProperty?: "yes" | "yes-charged" | "no";
  // Vehicle
  hasVehicle?: boolean;
  vehicleYear?: number;
  vehicleMake?: string;
  // Bank
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  // Loans existing
  existingLoans?: { provider: string; balance: number; monthly: number; interest: number }[];
  // Lender results
  lenderChecks?: Record<string, LenderCheck>;
  // Final
  finalApprovedAmount?: number;
  finalLender?: string;
  feeAmount?: number;
  feeWithVat?: number;
  // Activities
  activities: Activity[];
  // Files
  files?: { name: string; url?: string; uploadedAt: string }[];
  // Forms
  forms?: { kind: string; status: "draft" | "sent" | "signed"; addedAt: string; signedAt?: string }[];
  // Tasks
  tasksCount?: number;
  tasksOverdue?: number;
}

export interface Task {
  id: string;
  leadId: string;
  leadName: string;
  type: "incoming" | "outgoing" | "future";
  authorId: number;
  text: string;
  dueAt: string;
  done?: boolean;
  urgent?: boolean;
}
