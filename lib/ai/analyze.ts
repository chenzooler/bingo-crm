// המנתח: לוקח תמלול + כללי בקרה + הקשר ליד ומחזיר ניתוח מובנה בעברית.
// משתמש ב-SDK הרשמי של Anthropic עם מודל claude-opus-5, פלט מובנה
// (output_config.format / json_schema) כדי שהצורה תהיה מובטחת, וגיבוי צד-שרת
// לסירובים. בלי מפתח - מחזיר ניתוח הדגמה סביר בעברית.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  ANALYSIS_EFFORT,
  ANALYSIS_MAX_TOKENS,
  ANALYSIS_MODEL,
  analysisProvider,
  anthropicKey,
} from "@/lib/ai/config";
import type { TranscriptSegment } from "@/lib/ai/transcribe";

// ============ הטיפוסים ============

export type RuleForAnalysis = {
  id: number;
  name: string;
  description?: string | null;
  kind: string; // required | forbidden
  criterion: string;
  severity: string; // low | medium | high | critical
};

export type LeadContext = {
  id?: number;
  fullName?: string | null;
  amountRequested?: number | null;
  stage?: string | null;
  loanPurpose?: string | null;
};

export type ComplianceFinding = {
  ruleId: number;
  ruleName: string;
  severity: string;
  passed: boolean;
  evidence: string;
  explanation: string;
};

export type Analysis = {
  summary: string;
  score: number;
  sentiment: "positive" | "neutral" | "negative";
  outcomeGuess: "advanced" | "callback" | "not-interested" | "no-answer" | "unclear";
  compliance: ComplianceFinding[];
  objections: Array<{ type: string; quote: string; response: string }>;
  extracted: {
    amountRequested: number | null;
    monthlyIncome: number | null;
    employment: string | null;
    hasVehicle: boolean | null;
    hasProperty: boolean | null;
    bankName: string | null;
    notes: string | null;
  };
  coaching: Array<{ title: string; detail: string; priority: "low" | "medium" | "high" }>;
  moments: Array<{ label: string; quote: string }>;
};

export type AnalysisSuccess = {
  ok: true;
  analysis: Analysis;
  model: string;
  tokensIn: number | null;
  tokensOut: number | null;
  simulated: boolean;
};

export type AnalysisFailure = {
  ok: false;
  /** הודעה בעברית להצגה ולשמירה ב-Call.aiError */
  error: string;
};

export type AnalysisResult = AnalysisSuccess | AnalysisFailure;

// ============ ולידציה (zod) ============

const complianceSchema = z.object({
  ruleId: z.number(),
  ruleName: z.string(),
  severity: z.string(),
  passed: z.boolean(),
  evidence: z.string(),
  explanation: z.string(),
});

const analysisSchema = z.object({
  summary: z.string(),
  score: z.number().min(0).max(100),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  outcomeGuess: z.enum(["advanced", "callback", "not-interested", "no-answer", "unclear"]),
  compliance: z.array(complianceSchema),
  objections: z.array(
    z.object({ type: z.string(), quote: z.string(), response: z.string() }),
  ),
  extracted: z.object({
    amountRequested: z.number().nullable(),
    monthlyIncome: z.number().nullable(),
    employment: z.string().nullable(),
    hasVehicle: z.boolean().nullable(),
    hasProperty: z.boolean().nullable(),
    bankName: z.string().nullable(),
    notes: z.string().nullable(),
  }),
  coaching: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      priority: z.enum(["low", "medium", "high"]),
    }),
  ),
  moments: z.array(z.object({ label: z.string(), quote: z.string() })),
});

// ============ סכמת ה-JSON למודל ============
// structured outputs דורש additionalProperties:false ו-required מלא בכל אובייקט.

const JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "score",
    "sentiment",
    "outcomeGuess",
    "compliance",
    "objections",
    "extracted",
    "coaching",
    "moments",
  ],
  properties: {
    summary: { type: "string", description: "סיכום השיחה בעברית, 2-3 משפטים" },
    score: { type: "integer", description: "ציון איכות השיחה 0-100" },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    outcomeGuess: {
      type: "string",
      enum: ["advanced", "callback", "not-interested", "no-answer", "unclear"],
    },
    compliance: {
      type: "array",
      description: "רשומה אחת לכל כלל בקרה שנמסר, באותו סדר",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ruleId", "ruleName", "severity", "passed", "evidence", "explanation"],
        properties: {
          ruleId: { type: "integer" },
          ruleName: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          passed: { type: "boolean" },
          evidence: {
            type: "string",
            description: "ציטוט מדויק מהתמלול שמוכיח את הקביעה, או מחרוזת ריקה",
          },
          explanation: { type: "string", description: "הסבר קצר בעברית" },
        },
      },
    },
    objections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "quote", "response"],
        properties: {
          type: { type: "string", description: "סוג ההתנגדות בעברית, למשל: ריבית גבוהה" },
          quote: { type: "string", description: "ציטוט הלקוח" },
          response: { type: "string", description: "איך הנציג הגיב" },
        },
      },
    },
    extracted: {
      type: "object",
      additionalProperties: false,
      required: [
        "amountRequested",
        "monthlyIncome",
        "employment",
        "hasVehicle",
        "hasProperty",
        "bankName",
        "notes",
      ],
      properties: {
        amountRequested: { type: ["number", "null"] },
        monthlyIncome: { type: ["number", "null"] },
        employment: { type: ["string", "null"] },
        hasVehicle: { type: ["boolean", "null"] },
        hasProperty: { type: ["boolean", "null"] },
        bankName: { type: ["string", "null"] },
        notes: { type: ["string", "null"] },
      },
    },
    coaching: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail", "priority"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
    moments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "quote"],
        properties: {
          label: { type: "string" },
          quote: { type: "string" },
        },
      },
    },
  },
};

// ============ הפרומפט ============

const SYSTEM_PROMPT = `אתה מנתח שיחות מכירה בחברת תיווך אשראי ישראלית בשם בינגו.
תפקידך: לקרוא תמלול של שיחה בין נציג ללקוח ולהפיק ניתוח מקצועי בעברית.

כללי ברזל:
1. כל קביעה שלך חייבת להתבסס אך ורק על מה שנאמר בתמלול. אסור להמציא ציטוטים.
2. אם משהו לא נאמר בשיחה - הכלל נכשל (passed=false) והשדה evidence נשאר ריק.
3. שדה evidence חייב להיות ציטוט מילולי מדויק מהתמלול, או מחרוזת ריקה. בלי פרפראזה.
4. בשדה extracted רושמים רק נתונים שהלקוח או הנציג אמרו במפורש. כל השאר null.
5. כתוב בעברית תקנית, בלי אמוג'ים, בלי קו מפריד ארוך.

איך לתת ציון (score, 0-100):
- 90 ומעלה: עמידה מלאה בכללי הבקרה, טיפול טוב בהתנגדויות, סגירה ברורה.
- 70-89: שיחה תקינה עם חריגות קלות או הזדמנויות שהוחמצו.
- 50-69: חריגה משמעותית אחת או יותר, או שיחה לא ממוקדת.
- מתחת ל-50: חריגה קריטית (למשל בדיקת אשראי בלי אישור, או הבטחת אישור).

לגבי כללי הבקרה:
- כלל מסוג required עובר (passed=true) רק אם הנציג באמת עשה את מה שהכלל דורש.
- כלל מסוג forbidden עובר (passed=true) רק אם הנציג לא הפר אותו. אם הנציג הפר - passed=false.
- החזר רשומה אחת לכל כלל שנמסר לך, עם אותו ruleId ו-ruleName בדיוק.

coaching: 1-4 הערות אימון קונקרטיות לנציג, מה לעשות אחרת בפעם הבאה.
moments: עד 5 רגעי מפתח בשיחה עם ציטוט, לניווט מהיר בהקלטה.`;

function buildUserPrompt(input: {
  transcript: { text: string; segments?: TranscriptSegment[] | null };
  rules: RuleForAnalysis[];
  lead?: LeadContext | null;
}): string {
  const { transcript, rules, lead } = input;

  const leadLines: string[] = [];
  if (lead?.fullName) leadLines.push(`שם הלקוח: ${lead.fullName}`);
  if (lead?.amountRequested) leadLines.push(`סכום מבוקש בכרטיס: ${lead.amountRequested}`);
  if (lead?.stage) leadLines.push(`שלב בכרטיס: ${lead.stage}`);
  if (lead?.loanPurpose) leadLines.push(`מטרת הלוואה בכרטיס: ${lead.loanPurpose}`);

  const rulesText = rules.length
    ? rules
        .map(
          (r) =>
            `- ruleId=${r.id} | שם: ${r.name} | סוג: ${r.kind === "forbidden" ? "אסור" : "חובה"} | חומרה: ${r.severity}\n  קריטריון: ${r.criterion}`,
        )
        .join("\n")
    : "(אין כללי בקרה פעילים - החזר compliance כמערך ריק)";

  const body = transcript.segments?.length
    ? transcript.segments
        .map((s) => {
          const who = s.speaker === "agent" ? "נציג" : s.speaker === "customer" ? "לקוח" : "דובר";
          return `[${Math.round(s.start)}s] ${who}: ${s.text}`;
        })
        .join("\n")
    : transcript.text;

  return [
    leadLines.length ? `הקשר הליד:\n${leadLines.join("\n")}` : "הקשר הליד: לא זמין",
    "",
    `כללי הבקרה לבדיקה:\n${rulesText}`,
    "",
    "תמלול השיחה:",
    "<<<",
    body,
    ">>>",
    "",
    "נתח את השיחה והחזר JSON לפי הסכמה.",
  ].join("\n");
}

// ============ מצב סימולציה ============

function mockAnalysis(rules: RuleForAnalysis[]): Analysis {
  // מדמה שיחה טובה שבה כלל "סיכום צעד הבא" ואחד נוסף עשויים להיכשל,
  // כדי שגם ה-UI של ההתראות יראה משהו במצב הדגמה.
  const compliance: ComplianceFinding[] = rules.map((r, idx) => {
    const failed = r.kind === "required" && idx % 4 === 3;
    return {
      ruleId: r.id,
      ruleName: r.name,
      severity: r.severity,
      passed: !failed,
      evidence: failed
        ? ""
        : r.kind === "forbidden"
          ? ""
          : "אני רוצה לבקש ממך אישור לבצע בדיקה של נתוני האשראי שלך במאגר",
      explanation: failed
        ? "לא נמצאה בתמלול אמירה שעונה על הקריטריון (סימולציה)"
        : "הנציג עמד בדרישת הכלל (סימולציה)",
    };
  });

  return {
    summary:
      "הנציג הציג את עצמו בשם בינגו, אסף נתוני הכנסה ותעסוקה וקיבל אישור מפורש לבדיקת נתוני אשראי. הלקוח מעוניין באיחוד הלוואות ובשיפוץ, וסוכם על שליחת הסכם התקשרות וחזרה למחרת. זהו ניתוח הדגמה - לא נעשתה קריאה אמיתית למנוע.",
    score: 82,
    sentiment: "positive",
    outcomeGuess: "advanced",
    compliance,
    objections: [
      {
        type: "שאלה על עלות וריבית",
        quote: "וכמה זה בערך? ומה הריבית שאני אקבל?",
        response: "הנציג הסביר שהריבית נקבעת על ידי הגוף המממן ושכר הטרחה מוצג בהסכם",
      },
    ],
    extracted: {
      amountRequested: 80000,
      monthlyIncome: 12000,
      employment: "שכיר בחברת הייטק, ותק ארבע שנים",
      hasVehicle: true,
      hasProperty: false,
      bankName: null,
      notes: "מטרה: איחוד שתי הלוואות ושיפוץ מטבח. גר בשכירות.",
    },
    coaching: [
      {
        title: "לאסוף את שם הבנק",
        detail: "לא נשאל באיזה בנק מתנהל החשבון - נתון שמשפיע על בחירת הגוף המממן.",
        priority: "medium",
      },
      {
        title: "לחזק את הסגירה",
        detail: "כדאי לוודא שהלקוח מאשר את מועד החזרה ולא רק שומע אותו.",
        priority: "low",
      },
    ],
    moments: [
      { label: "אישור לבדיקת רמזור", quote: "כן, אני מאשר." },
      { label: "מטרת ההלוואה", quote: "אני רוצה לסגור שתי הלוואות קטנות ולעשות שיפוץ במטבח." },
      { label: "סיכום", quote: "מחר בעשר. תודה." },
    ],
  };
}

// ============ הקריאה למנוע ============

function extractJsonText(content: Anthropic.Beta.BetaContentBlock[]): string | null {
  for (const block of content) {
    if (block.type === "text" && block.text.trim()) return block.text;
  }
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callClaude(
  client: Anthropic,
  userPrompt: string,
  extraInstruction?: string,
): Promise<
  | { kind: "ok"; raw: string; tokensIn: number | null; tokensOut: number | null }
  | { kind: "refusal"; reason: string }
> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: extraInstruction ? `${userPrompt}\n\n${extraInstruction}` : userPrompt },
  ];

  const response = await client.beta.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: ANALYSIS_MAX_TOKENS,
    // גיבוי צד-שרת: אם מסווגי הבטיחות דוחים, הבקשה מנותבת אוטומטית למודל גיבוי
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    output_config: {
      effort: ANALYSIS_EFFORT,
      format: { type: "json_schema", schema: JSON_SCHEMA },
    },
    messages,
  });

  // בודקים סירוב לפני שנוגעים ב-content
  if (response.stop_reason === "refusal") {
    const category = response.stop_details?.category ?? "לא ידוע";
    return {
      kind: "refusal",
      reason: `מנגנון הבטיחות של המנוע דחה את הבקשה (קטגוריה: ${category}). הניתוח לא בוצע.`,
    };
  }

  const raw = extractJsonText(response.content);
  if (!raw) {
    return { kind: "refusal", reason: "המנוע החזיר תשובה ריקה - הניתוח לא בוצע." };
  }

  return {
    kind: "ok",
    raw,
    tokensIn: response.usage?.input_tokens ?? null,
    tokensOut: response.usage?.output_tokens ?? null,
  };
}

/** משלים חסרים: מוודא שיש רשומת compliance לכל כלל שנמסר */
function reconcileCompliance(analysis: Analysis, rules: RuleForAnalysis[]): Analysis {
  if (!rules.length) return { ...analysis, compliance: [] };
  const byId = new Map(analysis.compliance.map((c) => [c.ruleId, c]));
  const compliance: ComplianceFinding[] = rules.map((r) => {
    const found = byId.get(r.id);
    if (found) {
      return { ...found, ruleName: r.name, severity: r.severity };
    }
    return {
      ruleId: r.id,
      ruleName: r.name,
      severity: r.severity,
      passed: false,
      evidence: "",
      explanation: "המנוע לא החזיר בדיקה לכלל הזה - נרשם ככישלון לבדיקה ידנית.",
    };
  });
  return { ...analysis, compliance };
}

/**
 * מנתח שיחה. לעולם לא זורק - מחזיר {ok:false, error} עם הודעה בעברית.
 */
export async function analyzeCall(input: {
  transcript: { text: string; segments?: TranscriptSegment[] | null };
  rules: RuleForAnalysis[];
  lead?: LeadContext | null;
}): Promise<AnalysisResult> {
  const rules = input.rules ?? [];

  // ---- מצב סימולציה ----
  if (analysisProvider() === "mock") {
    return {
      ok: true,
      analysis: mockAnalysis(rules),
      model: "mock",
      tokensIn: null,
      tokensOut: null,
      simulated: true,
    };
  }

  const apiKey = anthropicKey();
  if (!apiKey) {
    return { ok: false, error: "חסר ANTHROPIC_API_KEY - לא ניתן לנתח את השיחה." };
  }

  const client = new Anthropic({ apiKey });
  const userPrompt = buildUserPrompt({ ...input, rules });

  const RETRY_INSTRUCTION =
    "התשובה הקודמת לא תאמה את הסכמה. החזר שוב JSON תקין בלבד, לפי הסכמה, בלי טקסט נוסף.";

  let lastParseError = "";
  let rateLimitRetries = 0;

  // עד 2 ניסיונות על אי-התאמה לסכמה, בנוסף ל-backoff על rate limit
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await callClaude(
        client,
        userPrompt,
        attempt > 0 ? RETRY_INSTRUCTION : undefined,
      );

      if (result.kind === "refusal") {
        return { ok: false, error: result.reason };
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(result.raw);
      } catch {
        lastParseError = "המנוע החזיר טקסט שאינו JSON תקין";
        continue;
      }

      const validated = analysisSchema.safeParse(parsedJson);
      if (!validated.success) {
        lastParseError = `מבנה הניתוח שהוחזר לא תקין: ${validated.error.issues
          .slice(0, 3)
          .map((i) => i.path.join("."))
          .join(", ")}`;
        continue;
      }

      return {
        ok: true,
        analysis: reconcileCompliance(validated.data as Analysis, rules),
        model: ANALYSIS_MODEL,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        simulated: false,
      };
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        if (rateLimitRetries < 2) {
          rateLimitRetries++;
          attempt--; // לא סופרים את זה כניסיון סכמה
          await sleep(1500 * rateLimitRetries);
          continue;
        }
        return { ok: false, error: "המנוע עמוס (מגבלת קצב). נסה שוב בעוד כמה דקות." };
      }
      if (err instanceof Anthropic.APIError) {
        return {
          ok: false,
          error: `שגיאה מהמנוע (${err.status ?? "ללא סטטוס"}): ${err.message.slice(0, 200)}`,
        };
      }
      return {
        ok: false,
        error: `שגיאה בלתי צפויה בניתוח: ${(err as Error)?.message?.slice(0, 200) ?? "לא ידועה"}`,
      };
    }
  }

  return {
    ok: false,
    error: lastParseError || "הניתוח נכשל - המנוע לא החזיר תשובה בפורמט הצפוי.",
  };
}
