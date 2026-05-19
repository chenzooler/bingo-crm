/**
 * Calls mock data - call recordings, transcripts, AI analysis
 */
import { LEADS } from "./leads";
import { USERS } from "./static";

export interface CallRecord {
  id: string;
  leadId: string;
  leadName: string;
  agentId: number;
  agentName: string;
  direction: "outgoing" | "incoming";
  startTime: string;
  duration: number; // seconds
  outcome: "answered" | "no-answer" | "busy" | "voicemail";
  recordingUrl: string | null;
  transcript: string | null;
  aiSummary: string | null;
  aiScore: number; // 0-100
  sentiment: "positive" | "neutral" | "negative";
  objections: string[];
  actionItems: string[];
  complianceFlags: string[];
}

const SAMPLE_TRANSCRIPTS = [
  {
    summary: "הלקוח התעניין בהלוואה של 50K לכיסוי חוב. אישר בדיקה. ביקש שניצור איתו קשר ביום שלישי.",
    sentiment: "positive" as const,
    objections: ["מחיר גבוה", "צריך זמן לחשוב"],
    actions: ["שלח טופס בדיקה ב-WhatsApp", "תזכורת לחיוג יום שלישי 10:00"],
  },
  {
    summary: "הלקוחה התעצבנה מההצעה. אמרה שמצאה מקום אחר זול יותר. הציעה הצעה מתחרה.",
    sentiment: "negative" as const,
    objections: ["יקר מדי", "יש לי הצעה אחרת"],
    actions: ["שלוח הצעה מועדפת", "עדכון מנהל"],
  },
  {
    summary: "הלקוח שאל מתי הכסף יגיע. הסברנו את התהליך. הוא הבטיח לחתום.",
    sentiment: "positive" as const,
    objections: [],
    actions: ["שלח חוזה לחתימה", "מעקב מחר"],
  },
  {
    summary: "שיחה קצרה, הלקוח אמר לחזור מאוחר יותר. לא הציג מידע.",
    sentiment: "neutral" as const,
    objections: ["לא זמין עכשיו"],
    actions: ["תזכורת לחיוג ביום שלישי"],
  },
];

const today = new Date();
const T = (offsetHours: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() - offsetHours);
  return d.toISOString();
};

const sampleAgents = USERS.filter((u) => ["agent", "manager", "underwriter"].includes(u.role)).slice(0, 8);

export const CALLS: CallRecord[] = LEADS.slice(0, 15).flatMap((lead, i) => {
  const numCalls = 1 + (i % 3);
  return Array.from({ length: numCalls }).map((_, callIdx) => {
    const agent = sampleAgents[(i + callIdx) % sampleAgents.length];
    const sample = SAMPLE_TRANSCRIPTS[(i + callIdx) % SAMPLE_TRANSCRIPTS.length];
    const outcomes: CallRecord["outcome"][] = ["answered", "answered", "answered", "no-answer", "voicemail"];
    const outcome = outcomes[(i + callIdx) % outcomes.length];
    const answered = outcome === "answered";

    return {
      id: `call-${lead.id}-${callIdx}`,
      leadId: lead.id,
      leadName: lead.fullName,
      agentId: agent.id,
      agentName: agent.name,
      direction: (callIdx % 4 === 0 ? "incoming" : "outgoing") as CallRecord["direction"],
      startTime: T(i * 3 + callIdx * 7),
      duration: answered ? 60 + Math.floor(Math.random() * 360) : Math.floor(Math.random() * 15),
      outcome,
      recordingUrl: answered ? `/api/recordings/${lead.id}-${callIdx}.mp3` : null,
      transcript: answered ? sample.summary : null,
      aiSummary: answered ? sample.summary : null,
      aiScore: answered ? 50 + Math.floor(Math.random() * 50) : 0,
      sentiment: answered ? sample.sentiment : "neutral",
      objections: answered ? sample.objections : [],
      actionItems: answered ? sample.actions : [],
      complianceFlags: i === 2 ? ["לא הזכיר ריבית"] : [],
    };
  });
});

/* Sort by date descending */
CALLS.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

export interface CallStat {
  label: string;
  value: string;
  delta: number;
}

export const CALL_STATS = {
  todayCount: CALLS.filter((c) => {
    const d = new Date(c.startTime);
    return d.toDateString() === today.toDateString();
  }).length,
  todayAnswered: CALLS.filter((c) => {
    const d = new Date(c.startTime);
    return d.toDateString() === today.toDateString() && c.outcome === "answered";
  }).length,
  weekTotal: CALLS.length,
  avgDuration: Math.round(CALLS.filter((c) => c.outcome === "answered").reduce((s, c) => s + c.duration, 0) / Math.max(1, CALLS.filter((c) => c.outcome === "answered").length)),
  avgScore: Math.round(CALLS.filter((c) => c.aiScore > 0).reduce((s, c) => s + c.aiScore, 0) / Math.max(1, CALLS.filter((c) => c.aiScore > 0).length)),
};

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}״`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
