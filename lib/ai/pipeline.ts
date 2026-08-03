// תזמורת הצינור: שיחה שהסתיימה -> תמלול -> ניתוח -> התראות/משימות/פעילות.
// עיקרון: processCall לעולם לא זורק. כל נתיב כשל מסמן aiStatus="failed"
// ושומר הודעה בעברית ב-aiError.
import { db } from "@/lib/db";
import { MIN_CALL_SECONDS, aiModeLabel, isSimulation } from "@/lib/ai/config";
import { countWords, transcribeRecording, type TranscriptSegment } from "@/lib/ai/transcribe";
import { analyzeCall, type LeadContext, type RuleForAnalysis } from "@/lib/ai/analyze";

export type ProcessResult = {
  callId: number;
  status: "done" | "failed" | "skipped" | "in-flight";
  /** הודעה בעברית לתצוגה */
  message: string;
  score?: number | null;
  violationCount?: number;
  alertsCreated?: number;
  simulated?: boolean;
};

/** הסטטוסים שנחשבים "בעבודה" - לא מפעילים שוב בלי force */
const IN_FLIGHT = new Set(["transcribing", "analyzing"]);

async function fail(callId: number, message: string): Promise<ProcessResult> {
  try {
    await db.call.update({
      where: { id: callId },
      data: { aiStatus: "failed", aiError: message.slice(0, 500) },
    });
  } catch {
    // אם גם העדכון נכשל - לא מפילים את הקורא
  }
  return { callId, status: "failed", message };
}

async function skip(callId: number, message: string): Promise<ProcessResult> {
  try {
    await db.call.update({
      where: { id: callId },
      data: { aiStatus: "skipped", aiError: message.slice(0, 500) },
    });
  } catch {
    /* noop */
  }
  return { callId, status: "skipped", message };
}

/**
 * בוחר את כללי הבקרה הרלוונטיים לשיחה.
 * appliesTo:
 *  - all        : תמיד
 *  - first-call : רק כשזו שיחה ראשונה עם הליד (אין שיחה קודמת שנענתה)
 *  - ramzor     : רק כשהליד עדיין לא עבר בדיקת רמזור (bdiApproved עדיין null)
 *  - closing    : רק בשיחות באורך סביר שבהן הגיוני שהייתה סגירה (30 שניות ומעלה)
 */
async function rulesForCall(call: {
  id: number;
  leadId: number | null;
  duration: number | null;
}): Promise<RuleForAnalysis[]> {
  const active = await db.complianceRule.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  if (!active.length) return [];

  let isFirstCall = true;
  let ramzorPending = true;

  if (call.leadId) {
    const [priorAnswered, lead] = await Promise.all([
      db.call.count({
        where: { leadId: call.leadId, status: "ANSWER", id: { not: call.id } },
      }),
      db.lead.findUnique({
        where: { id: call.leadId },
        select: { bdiApproved: true, smiley: true },
      }),
    ]);
    isFirstCall = priorAnswered === 0;
    ramzorPending = !lead || (lead.bdiApproved === null && !lead.smiley);
  }

  const longEnoughForClosing = (call.duration ?? 0) >= 30;

  return active
    .filter((r) => {
      switch (r.appliesTo) {
        case "first-call":
          return isFirstCall;
        case "ramzor":
          return ramzorPending;
        case "closing":
          return longEnoughForClosing;
        default:
          return true;
      }
    })
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      kind: r.kind,
      criterion: r.criterion,
      severity: r.severity,
    }));
}

const SEVERITY_LABEL: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  critical: "קריטית",
};

/**
 * מריץ את הצינור המלא על שיחה אחת.
 * force=true מריץ מחדש גם על שיחה שכבר עברה עיבוד (מוחק תמלול/ניתוח קודמים).
 */
export async function processCall(
  callId: number,
  opts: { force?: boolean } = {},
): Promise<ProcessResult> {
  const force = !!opts.force;

  let call;
  try {
    call = await db.call.findUnique({
      where: { id: callId },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            amountRequested: true,
            stage: true,
            loanPurpose: true,
          },
        },
      },
    });
  } catch (err) {
    return { callId, status: "failed", message: `שגיאת מסד נתונים: ${(err as Error).message}` };
  }

  if (!call) {
    return { callId, status: "failed", message: `שיחה ${callId} לא נמצאה` };
  }

  // ---- שומרי סף ----
  if (!force && call.aiStatus === "done") {
    return { callId, status: "done", message: "השיחה כבר נותחה" };
  }
  if (!force && IN_FLIGHT.has(call.aiStatus)) {
    return { callId, status: "in-flight", message: "השיחה כבר בעיבוד" };
  }
  if (!call.recordUrl) {
    return skip(callId, "אין הקלטה לשיחה - אין מה לתמלל");
  }
  if ((call.duration ?? 0) < MIN_CALL_SECONDS) {
    return skip(
      callId,
      `השיחה קצרה מדי לניתוח (${call.duration ?? 0} שניות, המינימום ${MIN_CALL_SECONDS})`,
    );
  }

  // ---- תמלול ----
  let transcriptText = "";
  let segments: TranscriptSegment[] = [];
  try {
    await db.call.update({
      where: { id: callId },
      data: { aiStatus: "transcribing", aiError: null },
    });

    const result = await transcribeRecording(call.recordUrl, { callId });
    transcriptText = result.text;
    segments = result.segments;

    const data = {
      text: result.text,
      segmentsJson: result.segments.length ? JSON.stringify(result.segments) : null,
      language: result.language,
      provider: result.provider,
      durationSec: result.durationSec ?? call.duration ?? null,
      wordCount: countWords(result.text),
    };
    await db.callTranscript.upsert({
      where: { callId },
      update: data,
      create: { callId, ...data },
    });
  } catch (err) {
    return fail(callId, `תמלול נכשל: ${(err as Error).message}`);
  }

  // ---- ניתוח ----
  let analysisRow;
  let violationCount = 0;
  let alertsCreated = 0;
  let simulated = false;

  try {
    await db.call.update({ where: { id: callId }, data: { aiStatus: "analyzing" } });

    const rules = await rulesForCall({
      id: call.id,
      leadId: call.leadId,
      duration: call.duration,
    });

    const leadCtx: LeadContext | null = call.lead
      ? {
          id: call.lead.id,
          fullName: call.lead.fullName,
          amountRequested: call.lead.amountRequested,
          stage: call.lead.stage,
          loanPurpose: call.lead.loanPurpose,
        }
      : null;

    const result = await analyzeCall({
      transcript: { text: transcriptText, segments },
      rules,
      lead: leadCtx,
    });

    if (!result.ok) {
      return fail(callId, `ניתוח נכשל: ${result.error}`);
    }

    simulated = result.simulated;
    const analysis = result.analysis;

    // חריגות = כללי חובה שנכשלו + כללי איסור שהופרו. בשתי המשפחות passed=false.
    const failedFindings = analysis.compliance.filter((c) => !c.passed);
    violationCount = failedFindings.length;

    const analysisData = {
      score: Math.round(analysis.score),
      summary: analysis.summary,
      sentiment: analysis.sentiment,
      outcomeGuess: analysis.outcomeGuess,
      complianceJson: JSON.stringify(analysis.compliance),
      objectionsJson: JSON.stringify(analysis.objections),
      extractedJson: JSON.stringify(analysis.extracted),
      coachingJson: JSON.stringify(analysis.coaching),
      momentsJson: JSON.stringify(analysis.moments),
      violationCount,
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
    };

    analysisRow = await db.callAnalysis.upsert({
      where: { callId },
      update: analysisData,
      create: { callId, ...analysisData },
    });

    // ---- התראות למנהלים ----
    // בהרצה חוזרת מוחקים התראות ישנות של אותה שיחה כדי לא לשכפל
    if (force) {
      await db.alert.deleteMany({ where: { callId, type: "compliance" } });
    }

    const rulesById = new Map(rules.map((r) => [r.id, r]));
    const alertableRuleIds = new Set(
      (
        await db.complianceRule.findMany({
          where: { id: { in: rules.map((r) => r.id) }, alertManager: true },
          select: { id: true },
        })
      ).map((r) => r.id),
    );

    const criticalFindings: typeof failedFindings = [];

    for (const finding of failedFindings) {
      if (!alertableRuleIds.has(finding.ruleId)) continue;
      const rule = rulesById.get(finding.ruleId);
      const isForbidden = rule?.kind === "forbidden";
      const leadName = call.lead?.fullName ? ` · ${call.lead.fullName}` : "";

      const bodyLines = [
        isForbidden
          ? `הנציג הפר כלל אסור: ${finding.ruleName}`
          : `הנציג לא ביצע פעולה מחייבת: ${finding.ruleName}`,
        finding.explanation ? `הסבר: ${finding.explanation}` : "",
        finding.evidence ? `ציטוט: "${finding.evidence}"` : "ציטוט: לא נמצאה אמירה רלוונטית",
        `חומרה: ${SEVERITY_LABEL[finding.severity] ?? finding.severity}`,
        simulated ? "(הופק במצב סימולציה)" : "",
      ].filter(Boolean);

      await db.alert.create({
        data: {
          type: "compliance",
          severity: finding.severity,
          title: `חריגת בקרה: ${finding.ruleName}${leadName}`,
          body: bodyLines.join("\n"),
          callId,
          leadId: call.leadId,
          agentId: call.userId,
          managerId: null, // null = לכל המנהלים
        },
      });
      alertsCreated++;

      if (finding.severity === "critical") criticalFindings.push(finding);
    }

    // ---- משימה מתפרצת למנהל על חריגה קריטית ----
    if (criticalFindings.length) {
      const manager = await db.user.findFirst({
        where: { active: true, role: { in: ["owner", "manager"] } },
        orderBy: [{ role: "asc" }, { id: "asc" }],
        select: { id: true },
      });
      if (manager) {
        const names = criticalFindings.map((f) => f.ruleName).join(", ");
        const who = call.lead?.fullName ? ` בשיחה עם ${call.lead.fullName}` : "";
        await db.task.create({
          data: {
            leadId: call.leadId,
            fromUserId: null,
            toUserId: manager.id,
            text: `חריגת בקרה קריטית${who}: ${names}. יש להאזין להקלטה ולתחקר את הנציג.`,
            urgent: true,
            channel: "call",
          },
        });
      }
    }

    // ---- פעילות על הליד ----
    if (call.leadId) {
      await db.activity.create({
        data: {
          leadId: call.leadId,
          userId: call.userId,
          type: "system",
          text: `ניתוח שיחה: ציון ${analysisData.score}, ${violationCount} חריגות${simulated ? " (סימולציה)" : ""}`,
          metaJson: JSON.stringify({
            callId,
            score: analysisData.score,
            violationCount,
            sentiment: analysis.sentiment,
            outcomeGuess: analysis.outcomeGuess,
            mode: aiModeLabel(),
          }),
        },
      });
    }

    await db.call.update({
      where: { id: callId },
      data: { aiStatus: "done", aiError: null },
    });
  } catch (err) {
    return fail(callId, `שמירת הניתוח נכשלה: ${(err as Error).message}`);
  }

  return {
    callId,
    status: "done",
    message: `הניתוח הושלם: ציון ${analysisRow.score}, ${violationCount} חריגות, ${alertsCreated} התראות`,
    score: analysisRow.score,
    violationCount,
    alertsCreated,
    simulated: simulated || isSimulation(),
  };
}

/**
 * רשת ביטחון: מריץ את הצינור על שיחות שממתינות לעיבוד (pending),
 * וגם על שיחות שנכשלו לפני יותר משעה. לקריאה מ-cron או ידנית.
 */
export async function processPending(limit = 10): Promise<{
  processed: number;
  results: ProcessResult[];
}> {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit) || 10));
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const calls = await db.call.findMany({
    where: {
      status: "ANSWER",
      recordUrl: { not: null },
      duration: { gte: MIN_CALL_SECONDS },
      OR: [{ aiStatus: "pending" }, { aiStatus: "failed", dialedAt: { lt: hourAgo } }],
    },
    orderBy: { dialedAt: "asc" },
    take: safeLimit,
    select: { id: true },
  });

  const results: ProcessResult[] = [];
  for (const c of calls) {
    results.push(await processCall(c.id, { force: true }));
  }
  return { processed: results.length, results };
}
