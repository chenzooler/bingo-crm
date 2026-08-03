// תמלול הקלטת שיחה -> טקסט + מקטעים עם חותמות זמן ודוברים.
// שלושה ספקים מאחורי ממשק אחד: elevenlabs (מועדף לעברית) / openai / mock.
//
// היוריסטיקת הדוברים: ההקלטות שלנו הן שיחות יוצאות (click2call/dialer) -
// המערכת מחייגת לנציג קודם ואז ללקוח, ולכן מי שמדבר ראשון הוא הנציג.
// לכן ה-speaker הראשון שמופיע בתמלול ממופה ל-"agent" והשני ל-"customer".
// אם הספק מחזיר יותר משני דוברים, כל היתר מסומנים "unknown".
import {
  MAX_RECORDING_BYTES,
  RECORDING_FETCH_TIMEOUT_MS,
  TRANSCRIBE_TIMEOUT_MS,
  elevenLabsKey,
  openAiKey,
  transcriptionProvider,
} from "@/lib/ai/config";

export type Speaker = "agent" | "customer" | "unknown";

export type TranscriptSegment = {
  /** שניות מתחילת ההקלטה */
  start: number;
  end: number;
  speaker: Speaker;
  text: string;
};

export type TranscriptionResult = {
  text: string;
  segments: TranscriptSegment[];
  provider: "elevenlabs" | "openai" | "mock";
  durationSec: number | null;
  language: string;
};

/** שגיאת תמלול עם הודעה בעברית שאפשר להציג למשתמש */
export class TranscriptionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "TranscriptionError";
  }
}

// ============ הורדת ההקלטה ============

/** מוריד את ה-mp3 עם timeout ותקרת גודל. מחזיר Blob. */
async function downloadRecording(url: string): Promise<Blob> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RECORDING_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new TranscriptionError(`הורדת ההקלטה נכשלה (סטטוס ${res.status})`);
    }

    const declared = Number(res.headers.get("content-length") || 0);
    if (declared && declared > MAX_RECORDING_BYTES) {
      throw new TranscriptionError(
        `ההקלטה גדולה מדי לתמלול (${Math.round(declared / 1024 / 1024)}MB, המקסימום ${Math.round(MAX_RECORDING_BYTES / 1024 / 1024)}MB)`,
      );
    }

    // קריאה בזרם עם ספירת בייטים - גם כשאין content-length
    const reader = res.body?.getReader();
    if (!reader) {
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_RECORDING_BYTES) {
        throw new TranscriptionError("ההקלטה גדולה מדי לתמלול");
      }
      return new Blob([buf], { type: res.headers.get("content-type") || "audio/mpeg" });
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_RECORDING_BYTES) {
        await reader.cancel().catch(() => {});
        throw new TranscriptionError(
          `ההקלטה חרגה מתקרת ${Math.round(MAX_RECORDING_BYTES / 1024 / 1024)}MB בזמן ההורדה`,
        );
      }
      chunks.push(value);
    }
    const parts: BlobPart[] = chunks.map(
      (c) => c.buffer.slice(c.byteOffset, c.byteOffset + c.byteLength) as ArrayBuffer,
    );
    return new Blob(parts, { type: res.headers.get("content-type") || "audio/mpeg" });
  } catch (err) {
    if (err instanceof TranscriptionError) throw err;
    if ((err as Error)?.name === "AbortError") {
      throw new TranscriptionError("פסק זמן בהורדת ההקלטה", err);
    }
    throw new TranscriptionError("שגיאה בהורדת ההקלטה מהשרת", err);
  } finally {
    clearTimeout(timer);
  }
}

// ============ מיפוי דוברים ============

/** ממפה מזהי דובר גולמיים (speaker_0/speaker_1) ל-agent/customer לפי סדר ההופעה */
function speakerMapper() {
  const order: string[] = [];
  return (raw: string | null | undefined): Speaker => {
    if (!raw) return "unknown";
    if (!order.includes(raw)) order.push(raw);
    const idx = order.indexOf(raw);
    if (idx === 0) return "agent"; // הדובר הראשון בשיחה יוצאת = הנציג
    if (idx === 1) return "customer";
    return "unknown";
  };
}

// ============ ElevenLabs ============

type ElevenWord = {
  text?: string;
  start?: number;
  end?: number;
  speaker_id?: string;
  type?: string;
};

/** מאחד מילים לרצפים לפי דובר -> מקטעים */
function wordsToSegments(words: ElevenWord[]): TranscriptSegment[] {
  const mapSpeaker = speakerMapper();
  const segments: TranscriptSegment[] = [];
  let current: TranscriptSegment | null = null;

  for (const w of words) {
    const text = w.text ?? "";
    if (!text) continue;
    const speaker = mapSpeaker(w.speaker_id);
    const start: number = typeof w.start === "number" ? w.start : (current?.end ?? 0);
    const end: number = typeof w.end === "number" ? w.end : start;

    if (current && current.speaker === speaker) {
      current.text += text;
      current.end = end;
    } else {
      if (current) segments.push({ ...current, text: current.text.trim() });
      current = { start, end, speaker, text };
    }
  }
  if (current) segments.push({ ...current, text: current.text.trim() });
  return segments.filter((s) => s.text.length > 0);
}

async function transcribeElevenLabs(blob: Blob, apiKey: string): Promise<TranscriptionResult> {
  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("language_code", "heb");
  form.append("diarize", "true");
  form.append("file", blob, "call.mp3");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSCRIBE_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new TranscriptionError(
        `שירות התמלול ElevenLabs החזיר שגיאה (${res.status}): ${detail.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as {
      text?: string;
      language_code?: string;
      words?: ElevenWord[];
      segments?: Array<{ start?: number; end?: number; text?: string; speaker_id?: string }>;
    };

    let segments: TranscriptSegment[] = [];
    if (Array.isArray(data.words) && data.words.length) {
      segments = wordsToSegments(data.words);
    } else if (Array.isArray(data.segments) && data.segments.length) {
      const mapSpeaker = speakerMapper();
      segments = data.segments
        .filter((s) => (s.text ?? "").trim())
        .map((s) => ({
          start: s.start ?? 0,
          end: s.end ?? s.start ?? 0,
          speaker: mapSpeaker(s.speaker_id),
          text: (s.text ?? "").trim(),
        }));
    }

    const text = (data.text ?? segments.map((s) => s.text).join(" ")).trim();
    if (!text) throw new TranscriptionError("התמלול חזר ריק - ייתכן שההקלטה שקטה או פגומה");

    const durationSec = segments.length ? Math.round(segments[segments.length - 1].end) : null;
    return {
      text,
      segments,
      provider: "elevenlabs",
      durationSec,
      language: data.language_code || "he",
    };
  } catch (err) {
    if (err instanceof TranscriptionError) throw err;
    if ((err as Error)?.name === "AbortError") {
      throw new TranscriptionError("פסק זמן בתמלול מול ElevenLabs", err);
    }
    throw new TranscriptionError("שגיאה בתקשורת עם שירות התמלול ElevenLabs", err);
  } finally {
    clearTimeout(timer);
  }
}

// ============ OpenAI Whisper (חלופה) ============

async function transcribeOpenAi(blob: Blob, apiKey: string): Promise<TranscriptionResult> {
  const form = new FormData();
  form.append("model", "whisper-1");
  form.append("language", "he");
  form.append("response_format", "verbose_json");
  form.append("file", blob, "call.mp3");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSCRIBE_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new TranscriptionError(
        `שירות התמלול OpenAI החזיר שגיאה (${res.status}): ${detail.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as {
      text?: string;
      duration?: number;
      language?: string;
      segments?: Array<{ start?: number; end?: number; text?: string }>;
    };

    // Whisper לא מפריד דוברים - הכל "unknown"
    const segments: TranscriptSegment[] = (data.segments ?? [])
      .filter((s) => (s.text ?? "").trim())
      .map((s) => ({
        start: s.start ?? 0,
        end: s.end ?? s.start ?? 0,
        speaker: "unknown" as const,
        text: (s.text ?? "").trim(),
      }));

    const text = (data.text ?? segments.map((s) => s.text).join(" ")).trim();
    if (!text) throw new TranscriptionError("התמלול חזר ריק - ייתכן שההקלטה שקטה או פגומה");

    return {
      text,
      segments,
      provider: "openai",
      durationSec: data.duration ? Math.round(data.duration) : null,
      language: data.language || "he",
    };
  } catch (err) {
    if (err instanceof TranscriptionError) throw err;
    if ((err as Error)?.name === "AbortError") {
      throw new TranscriptionError("פסק זמן בתמלול מול OpenAI", err);
    }
    throw new TranscriptionError("שגיאה בתקשורת עם שירות התמלול OpenAI", err);
  } finally {
    clearTimeout(timer);
  }
}

// ============ סימולציה ============

/** שיחת תיווך אשראי אמיתית לדוגמה - להדגמה ולבדיקות */
const MOCK_SEGMENTS: Array<[number, number, Speaker, string]> = [
  [0, 4, "agent", "שלום, מדבר יוסי מחברת בינגו, מימון בול בשבילך. אני מתקשר בקשר לפנייה שהשארת אצלנו באתר."],
  [4, 7, "customer", "כן, שלום. השארתי פרטים לגבי הלוואה."],
  [7, 14, "agent", "מצוין. אני רואה כאן שביקשת שמונים אלף שקל. אני רוצה לוודא איתך כמה נתונים לפני שנתקדם. קודם כל, ההכנסה החודשית נטו שלך?"],
  [14, 18, "customer", "בערך שנים עשר אלף שקל בחודש, אני שכיר בחברת הייטק כבר ארבע שנים."],
  [18, 24, "agent", "יפה מאוד. יש לך רכב על שמך? ודירה בבעלות?"],
  [24, 30, "customer", "יש לי רכב, מאזדה שלוש משנת אלפיים עשרים. דירה אין, אני גר בשכירות."],
  [30, 38, "agent", "בסדר גמור. אני רוצה לבקש ממך אישור לבצע בדיקה של נתוני האשראי שלך במאגר. הבדיקה הזאת לא פוגעת בדירוג ומטרתה רק לראות מול איזה גוף כדאי להגיש. אתה מאשר לי?"],
  [38, 40, "customer", "כן, אני מאשר."],
  [40, 46, "agent", "תודה. שאלה נוספת - למה הכסף מיועד? זה עוזר לי להתאים את הגוף הנכון."],
  [46, 50, "customer", "אני רוצה לסגור שתי הלוואות קטנות ולעשות שיפוץ במטבח."],
  [50, 60, "agent", "מובן, איחוד הלוואות. אני רוצה להיות שקוף איתך לגבי העלות: יש שכר טרחה שנגבה רק אחרי שההלוואה מאושרת ומועברת אליך. אם לא מתקבלת הלוואה - אתה לא משלם כלום."],
  [60, 64, "customer", "וכמה זה בערך? ומה הריבית שאני אקבל?"],
  [64, 74, "agent", "לגבי הריבית - אני לא יכול לנקוב במספר בשלב הזה, זה נקבע על ידי הגוף המממן אחרי הבדיקה. שכר הטרחה מוצג לך בהסכם ההתקשרות לפני שאתה חותם."],
  [74, 78, "customer", "בסדר. מה השלב הבא?"],
  [78, 90, "agent", "אני שולח לך עכשיו בוואטסאפ הסכם התקשרות לחתימה דיגיטלית. אחרי שתחתום אני מגיש לבדיקה בגופים ואני חוזר אליך מחר בבוקר עם התשובות. מתאים לך שנדבר מחר בסביבות עשר?"],
  [90, 93, "customer", "מעולה, מחר בעשר. תודה."],
  [93, 96, "agent", "תודה רבה, יום טוב."],
];

function mockTranscript(): TranscriptionResult {
  const segments: TranscriptSegment[] = MOCK_SEGMENTS.map(([start, end, speaker, text]) => ({
    start,
    end,
    speaker,
    text,
  }));
  return {
    text: segments.map((s) => `${s.speaker === "agent" ? "נציג" : "לקוח"}: ${s.text}`).join("\n"),
    segments,
    provider: "mock",
    durationSec: segments[segments.length - 1].end,
    language: "he",
  };
}

// ============ ה-API הציבורי ============

/**
 * מתמלל הקלטה לפי הספק הזמין. במצב mock לא מוריד כלום ומחזיר תמלול הדגמה.
 * זורק TranscriptionError עם הודעה בעברית בכל כשל.
 */
export async function transcribeRecording(
  url: string,
  opts: { callId: number },
): Promise<TranscriptionResult> {
  const provider = transcriptionProvider();

  if (provider === "mock") {
    // מצב סימולציה - לא נוגעים ברשת בכלל
    return mockTranscript();
  }

  if (!url) {
    throw new TranscriptionError(`לשיחה ${opts.callId} אין קישור הקלטה לתמלול`);
  }

  const blob = await downloadRecording(url);
  if (blob.size === 0) {
    throw new TranscriptionError("קובץ ההקלטה ריק");
  }

  if (provider === "elevenlabs") {
    const key = elevenLabsKey();
    if (!key) throw new TranscriptionError("חסר ELEVENLABS_API_KEY");
    return transcribeElevenLabs(blob, key);
  }

  const key = openAiKey();
  if (!key) throw new TranscriptionError("חסר OPENAI_API_KEY");
  return transcribeOpenAi(blob, key);
}

/** ספירת מילים גסה - לשמירה ב-CallTranscript */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
