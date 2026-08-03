// תצורת ה-AI המרכזית + זיהוי יכולות.
// עיקרון מנחה: הצינור כולו רץ גם בלי אף מפתח - במצב סימולציה מסומן היטב
// (תמלול דמו בעברית + ניתוח דמו). ברגע שמוסיפים מפתח ל-env זה הופך לאמיתי,
// בלי שינוי קוד. לעולם לא מדפיסים ערך של מפתח - רק boolean של "קיים".

/** ספק התמלול שנבחר בפועל */
export type TranscriptionProvider = "elevenlabs" | "openai" | "mock";
/** מנוע הניתוח שנבחר בפועל */
export type AnalysisProvider = "claude" | "mock";

export type AiCapabilities = {
  transcription: TranscriptionProvider;
  analysis: AnalysisProvider;
  /** true רק כששני החלקים אמיתיים (לא סימולציה) */
  ready: boolean;
  /** הסברים בעברית: מה חסר ומה זה נותן */
  missing: string[];
};

/** המודל של המנתח. מחרוזת מדויקת, בלי סיומת תאריך. */
export const ANALYSIS_MODEL = "claude-opus-5";

/** תקציב הפלט לניתוח שיחה בודדת */
export const ANALYSIS_MAX_TOKENS = 8000;

/** רמת המאמץ - איזון בין עומק לעלות */
export const ANALYSIS_EFFORT = "medium" as const;

/** תקרת גודל להורדת הקלטה (בייטים) - 40MB */
export const MAX_RECORDING_BYTES = 40 * 1024 * 1024;

/** timeout להורדת ההקלטה (מילישניות) */
export const RECORDING_FETCH_TIMEOUT_MS = 120_000;

/** timeout לקריאת ספק התמלול (מילישניות) */
export const TRANSCRIBE_TIMEOUT_MS = 300_000;

/** משך מינימלי של שיחה שראוי לנתח (שניות) */
export const MIN_CALL_SECONDS = 10;

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() ? v.trim() : undefined;
}

export function anthropicKey(): string | undefined {
  return env("ANTHROPIC_API_KEY");
}
export function elevenLabsKey(): string | undefined {
  return env("ELEVENLABS_API_KEY");
}
export function openAiKey(): string | undefined {
  return env("OPENAI_API_KEY");
}

/** איזה ספק תמלול נבחר בפועל לפי המפתחות הקיימים */
export function transcriptionProvider(): TranscriptionProvider {
  if (elevenLabsKey()) return "elevenlabs";
  if (openAiKey()) return "openai";
  return "mock";
}

/** איזה מנוע ניתוח נבחר בפועל */
export function analysisProvider(): AnalysisProvider {
  return anthropicKey() ? "claude" : "mock";
}

/** האם אנחנו במצב סימולציה כלשהו (תמלול או ניתוח) */
export function isSimulation(): boolean {
  return transcriptionProvider() === "mock" || analysisProvider() === "mock";
}

/** תיאור היכולות + מה חסר, בעברית, למסך ההגדרות */
export function aiCapabilities(): AiCapabilities {
  const transcription = transcriptionProvider();
  const analysis = analysisProvider();
  const missing: string[] = [];

  if (transcription === "mock") {
    missing.push(
      "ELEVENLABS_API_KEY - תמלול עברית איכותי עם הפרדת דוברים (מומלץ). בלעדיו התמלול הוא הדגמה בלבד.",
    );
    missing.push(
      "OPENAI_API_KEY - חלופה לתמלול (Whisper). איכות עברית פחות טובה ובלי הפרדת דוברים.",
    );
  } else if (transcription === "openai") {
    missing.push(
      "ELEVENLABS_API_KEY - שדרוג התמלול: עברית מדויקת יותר והפרדה בין הנציג ללקוח.",
    );
  }

  if (analysis === "mock") {
    missing.push(
      "ANTHROPIC_API_KEY - הניתוח האמיתי (ציון, חריגות בקרה, אימון נציג, שליפת נתונים). בלעדיו הניתוח הוא הדגמה בלבד.",
    );
  }

  return {
    transcription,
    analysis,
    ready: transcription !== "mock" && analysis !== "mock",
    missing,
  };
}

/** כותרת קצרה בעברית למצב הנוכחי - לשימוש ב-UI */
export function aiModeLabel(): string {
  const caps = aiCapabilities();
  if (caps.ready) return "מצב אמיתי";
  if (caps.transcription === "mock" && caps.analysis === "mock") return "מצב סימולציה (ללא מפתחות)";
  if (caps.transcription === "mock") return "סימולציה בתמלול, ניתוח אמיתי";
  return "תמלול אמיתי, סימולציה בניתוח";
}
