// מסך סקירת השיחה - הדגל של חבילת האיכות.
// שיחה אחת: הקלטה + תמלול מסונכרן + כל מה שמנוע ה-AI מצא, במסך אחד למנהל.
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight, ShieldCheck, ShieldAlert, MessageSquareWarning, GraduationCap,
  Sparkles, Database, AlertTriangle, Check, X, PhoneCall, Clock,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import { CallReviewProvider } from "@/components/manager/CallReviewContext";
import { CallAudioPlayer } from "@/components/manager/CallAudioPlayer";
import { CallTranscriptPanel } from "@/components/manager/CallTranscriptPanel";
import { SeekButton } from "@/components/manager/SeekButton";
import { RerunAnalysisButton, ResolveAlertsButton } from "@/components/manager/CallActions";
import {
  parseArray, parseObject, formatDuration, scoreBand, SCORE_TINT, SCORE_CHIP,
  SEVERITY_LABEL, SEVERITY_CHIP, AI_STATUS_LABEL, DISPOSITION_LABEL,
  SENTIMENT_LABEL, SENTIMENT_CHIP, EXTRACTED_LABEL, displayValue, findQuoteStart,
  coachingSort, priorityLabel,
  type TranscriptSegment, type ComplianceResult, type Objection, type CoachingNote, type KeyMoment,
} from "@/components/manager/quality-utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CallReviewPage({ params }: PageProps) {
  const { id } = await params;
  const callId = Number(id);
  if (!Number.isInteger(callId) || callId <= 0) notFound();

  const call = await db.call.findUnique({
    where: { id: callId },
    include: {
      lead: { select: { id: true, fullName: true, phone: true, stage: true, amountRequested: true } },
      user: { select: { id: true, name: true, emoji: true } },
      transcript: true,
      analysis: true,
      alerts: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!call) notFound();

  const segments = parseArray<TranscriptSegment>(call.transcript?.segmentsJson).filter(
    (s) => typeof s?.start === "number" && typeof s?.text === "string",
  );
  const analysis = call.analysis;
  const compliance = parseArray<ComplianceResult>(analysis?.complianceJson ?? null);
  const objections = parseArray<Objection>(analysis?.objectionsJson ?? null);
  const coaching = parseArray<CoachingNote>(analysis?.coachingJson ?? null).sort(coachingSort);
  const moments = parseArray<KeyMoment>(analysis?.momentsJson ?? null);
  const extracted = parseObject(analysis?.extractedJson ?? null);

  const band = scoreBand(analysis?.score);
  const openAlertIds = call.alerts.filter((a) => !a.resolvedAt).map((a) => a.id);
  const working = ["pending", "transcribing", "analyzing"].includes(call.aiStatus);
  const broken = ["failed", "skipped"].includes(call.aiStatus);

  return (
    <CallReviewProvider>
      <div className="max-w-[1500px] space-y-4">
        {/* ===== כותרת ===== */}
        <header className="b-card !p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3.5 min-w-0">
              <span className="b-icon b-icon-dark !size-11 shrink-0">
                <PhoneCall className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="b-eyebrow">סקירת שיחה</div>
                <h1 className="text-[26px] font-black tracking-tight text-bingo-black leading-tight">
                  {call.lead ? (
                    <Link href={`/leads/${call.lead.id}`} className="hover:text-bingo-green-dark transition">
                      {call.lead.fullName || "ליד ללא שם"}
                    </Link>
                  ) : (
                    <span>{call.targetPhone || "שיחה ללא ליד"}</span>
                  )}
                </h1>
                <div className="flex items-center gap-2 flex-wrap mt-2 text-[12px] text-bingo-gray-600">
                  <span className="font-bold text-bingo-black">
                    {call.user?.emoji ? `${call.user.emoji} ` : ""}{call.user?.name || "ללא נציג"}
                  </span>
                  <span className="text-bingo-gray-300">·</span>
                  <span>{formatDate(call.dialedAt)} {formatTime(call.dialedAt)}</span>
                  <span className="text-bingo-gray-300">·</span>
                  <span className="font-mono tabular-nums inline-flex items-center gap-1">
                    <Clock className="size-3" />{formatDuration(call.duration)}
                  </span>
                  {call.disposition && (
                    <span className="b-chip b-chip-blue">
                      {DISPOSITION_LABEL[call.disposition] ?? call.disposition}
                    </span>
                  )}
                  {analysis?.sentiment && (
                    <span className={`b-chip ${SENTIMENT_CHIP[analysis.sentiment] ?? "b-chip-gray"}`}>
                      {SENTIMENT_LABEL[analysis.sentiment] ?? analysis.sentiment}
                    </span>
                  )}
                  {(analysis?.violationCount ?? 0) > 0 && (
                    <span className="b-chip b-chip-red">
                      {analysis?.violationCount} חריגות
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {analysis?.score !== null && analysis?.score !== undefined ? (
                <div className={`${SCORE_TINT[band]} rounded-[20px] px-5 py-3 text-center b-spring-in`}>
                  <div className="text-[32px] font-black tabular-nums leading-none text-bingo-black">
                    {analysis.score}
                  </div>
                  <div className="text-[10px] font-bold text-bingo-black/60 mt-1">ציון שיחה</div>
                </div>
              ) : (
                <div className="rounded-[20px] px-5 py-3 text-center bg-bingo-gray-100">
                  <div className="text-[24px] font-black tabular-nums leading-none text-bingo-gray-400">-</div>
                  <div className="text-[10px] font-bold text-bingo-gray-500 mt-1">אין ציון</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-bingo-gray-100">
            <Link href="/calls" className="b-pill b-pill-ghost b-pill-sm">
              <ArrowRight className="size-4" /> חזרה לתור
            </Link>
            {call.lead && (
              <Link href={`/leads/${call.lead.id}`} className="b-pill b-pill-ghost b-pill-sm">
                פתח כרטיס
              </Link>
            )}
            <RerunAnalysisButton callId={call.id} size="sm" />
            <ResolveAlertsButton alertIds={openAlertIds} />
            <span className={`b-chip ${SCORE_CHIP[band]} mr-auto`}>
              {AI_STATUS_LABEL[call.aiStatus] ?? call.aiStatus}
            </span>
          </div>
        </header>

        {/* ===== התראות פתוחות ===== */}
        {call.alerts.length > 0 && (
          <section className="b-card !p-4 b-tint-rose">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="size-4 text-status-red" />
              <h2 className="text-[14px] font-bold text-bingo-black">התראות על השיחה</h2>
            </div>
            <div className="space-y-1.5">
              {call.alerts.map((a) => (
                <div key={a.id} className="bg-white/70 rounded-xl px-3 py-2 flex items-start gap-2">
                  <span className={`b-chip ${SEVERITY_CHIP[a.severity] ?? "b-chip-gray"} shrink-0`}>
                    {SEVERITY_LABEL[a.severity] ?? a.severity}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-bingo-black">{a.title}</div>
                    {a.body && <div className="text-[12px] text-bingo-gray-600 mt-0.5">{a.body}</div>}
                  </div>
                  {a.resolvedAt && <span className="b-chip b-chip-green mr-auto shrink-0">טופל</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ===== הקלטה + תמלול ===== */}
          <div className="lg:col-span-7 space-y-4">
            <CallAudioPlayer src={call.recordUrl} fallbackDuration={call.duration} />
            <CallTranscriptPanel segments={segments} fullText={call.transcript?.text ?? null} />
          </div>

          {/* ===== תובנות ה-AI ===== */}
          <div className="lg:col-span-5 space-y-4">
            {working && <ProcessingCard status={call.aiStatus} />}
            {broken && <FailedCard status={call.aiStatus} error={call.aiError} callId={call.id} />}

            {analysis && (
              <>
                {analysis.summary && (
                  <Panel title="סיכום השיחה" icon={<Sparkles className="size-4" />} tone="b-icon-green">
                    <p className="text-[13px] leading-relaxed text-bingo-charcoal">{analysis.summary}</p>
                    {analysis.outcomeGuess && (
                      <div className="mt-3 text-[11px] text-bingo-gray-500">
                        הערכת המנוע לתוצאה:{" "}
                        <span className="font-bold text-bingo-black">
                          {DISPOSITION_LABEL[analysis.outcomeGuess] ?? analysis.outcomeGuess}
                        </span>
                      </div>
                    )}
                  </Panel>
                )}

                {moments.length > 0 && (
                  <Panel title="רגעי מפתח" icon={<Clock className="size-4" />} tone="b-icon-purple">
                    <div className="flex flex-wrap gap-1.5">
                      {moments.map((m, i) => {
                        const at = typeof m.start === "number" ? m.start : findQuoteStart(m.quote, segments);
                        return (
                          <SeekButton
                            key={i}
                            seconds={at}
                            showTime={at !== null}
                            className={`b-chip ${at !== null ? "b-chip-dark" : "b-chip-gray"} !text-[11px]`}
                          >
                            {m.label || m.quote || "רגע"}
                          </SeekButton>
                        );
                      })}
                    </div>
                  </Panel>
                )}

                <Panel
                  title="עמידה בכללי הבקרה"
                  icon={compliance.some((c) => c.passed === false) ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
                  tone={compliance.some((c) => c.passed === false) ? "b-icon-red" : "b-icon-green"}
                >
                  {compliance.length === 0 ? (
                    <Empty text="המנוע לא בדק כללים בשיחה הזו" />
                  ) : (
                    <div className="space-y-2">
                      {compliance.map((c, i) => {
                        const passed = c.passed !== false;
                        const at = findQuoteStart(c.evidence, segments);
                        return (
                          <div
                            key={i}
                            className={`rounded-2xl px-3 py-2.5 ${passed ? "b-tint-mint" : c.severity === "critical" || c.severity === "high" ? "b-tint-rose" : "b-tint-peach"}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`size-5 rounded-full inline-flex items-center justify-center shrink-0 mt-0.5 ${passed ? "bg-bingo-green text-bingo-black" : "bg-status-red text-white"}`}>
                                {passed ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[13px] font-bold text-bingo-black">
                                    {c.ruleName || `כלל ${c.ruleId ?? i + 1}`}
                                  </span>
                                  {!passed && c.severity && (
                                    <span className={`b-chip ${SEVERITY_CHIP[c.severity] ?? "b-chip-gray"} !text-[10px]`}>
                                      {SEVERITY_LABEL[c.severity] ?? c.severity}
                                    </span>
                                  )}
                                </div>
                                {c.explanation && (
                                  <p className="text-[12px] text-bingo-charcoal/80 mt-1 leading-relaxed">{c.explanation}</p>
                                )}
                                {c.evidence && (
                                  <SeekButton
                                    seconds={at}
                                    showTime={at !== null}
                                    className="block w-full mt-1.5 rounded-xl bg-white/70 px-2.5 py-1.5 text-[12px] text-bingo-charcoal italic"
                                  >
                                    &quot;{c.evidence}&quot;
                                  </SeekButton>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>

                {objections.length > 0 && (
                  <Panel title="התנגדויות הלקוח" icon={<MessageSquareWarning className="size-4" />} tone="b-icon-orange">
                    <div className="space-y-2">
                      {objections.map((o, i) => {
                        const at = findQuoteStart(o.quote, segments);
                        return (
                          <div key={i} className="rounded-2xl b-tint-sand px-3 py-2.5">
                            <div className="text-[12px] font-bold text-bingo-black">{o.type || "התנגדות"}</div>
                            {o.quote && (
                              <SeekButton
                                seconds={at}
                                showTime={at !== null}
                                className="block w-full mt-1.5 rounded-xl bg-white/70 px-2.5 py-1.5 text-[12px] text-bingo-charcoal italic"
                              >
                                &quot;{o.quote}&quot;
                              </SeekButton>
                            )}
                            {o.response && (
                              <div className="text-[12px] text-bingo-charcoal/80 mt-1.5 leading-relaxed">
                                <span className="font-bold">תגובת הנציג: </span>{o.response}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                )}

                {coaching.length > 0 && (
                  <Panel title="הערות אימון לנציג" icon={<GraduationCap className="size-4" />} tone="b-icon-blue">
                    <div className="space-y-2">
                      {coaching.map((c, i) => (
                        <div key={i} className="rounded-2xl b-tint-sky px-3 py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-bold text-bingo-black">{c.title || "הערה"}</span>
                            <span className="b-chip b-chip-gray !text-[10px]">{priorityLabel(c.priority)}</span>
                          </div>
                          {c.detail && (
                            <p className="text-[12px] text-bingo-charcoal/80 mt-1 leading-relaxed">{c.detail}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {Object.keys(extracted).length > 0 && (
                  <Panel title="נתונים שנשלפו מהשיחה" icon={<Database className="size-4" />} tone="b-icon-gray">
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {Object.entries(extracted).map(([k, v]) => (
                        <div key={k} className="min-w-0">
                          <dt className="text-[10px] font-bold text-bingo-gray-500">{EXTRACTED_LABEL[k] ?? k}</dt>
                          <dd className="text-[13px] font-bold text-bingo-black truncate">{displayValue(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </Panel>
                )}
              </>
            )}

            {!analysis && !working && !broken && (
              <Panel title="ניתוח השיחה" icon={<Sparkles className="size-4" />} tone="b-icon-gray">
                <Empty text="עוד לא נשמר ניתוח לשיחה הזו" />
                <div className="mt-3">
                  <RerunAnalysisButton callId={call.id} size="sm" />
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </CallReviewProvider>
  );
}

function Panel({ title, icon, tone, children }: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <section className="b-card !p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`b-icon ${tone} !size-8 shrink-0`}>{icon}</span>
        <h2 className="text-[15px] font-bold text-bingo-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-[12px] text-bingo-gray-500 py-2">{text}</div>;
}

/** מצב עבודה - המנוע עוד רץ על השיחה */
function ProcessingCard({ status }: { status: string }) {
  return (
    <section className="b-card !p-5 overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="b-icon b-icon-blue !size-10 shrink-0 b-scan">
          <Sparkles className="size-4" />
        </span>
        <div>
          <div className="text-[15px] font-bold text-bingo-black">{AI_STATUS_LABEL[status] ?? status}</div>
          <div className="text-[12px] text-bingo-gray-500 mt-0.5">התובנות יופיעו כאן ברגע שהמנוע יסיים</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[92, 78, 64].map((w, i) => (
          <div key={i} className="h-3 rounded-full bg-bingo-gray-100 b-scan" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </section>
  );
}

/** מצב כשל - שקט, מסביר, ומאפשר לנסות שוב */
function FailedCard({ status, error, callId }: { status: string; error: string | null; callId: number }) {
  return (
    <section className="b-card !p-5 bg-bingo-gray-50">
      <div className="flex items-center gap-3 mb-2">
        <span className="b-icon b-icon-gray !size-10 shrink-0">
          <AlertTriangle className="size-4" />
        </span>
        <div>
          <div className="text-[15px] font-bold text-bingo-black">{AI_STATUS_LABEL[status] ?? status}</div>
          <div className="text-[12px] text-bingo-gray-500 mt-0.5">
            {status === "skipped" ? "השיחה לא נשלחה לניתוח" : "המנוע לא הצליח לסיים את הניתוח"}
          </div>
        </div>
      </div>
      {error && (
        <div className="rounded-xl bg-white border border-bingo-gray-150 px-3 py-2 text-[12px] text-bingo-gray-600 font-mono break-words">
          {error}
        </div>
      )}
      <div className="mt-3">
        <RerunAnalysisButton callId={callId} size="sm" />
      </div>
    </section>
  );
}
