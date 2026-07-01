"use client";
import * as React from "react";
import Link from "next/link";
import {
  Phone, MessageCircle, ChevronRight, Check, Car, FileSignature,
  AlarmClock, Banknote, ShieldCheck, Trophy, Send, StickyNote,
  CalendarClock, AlertTriangle, PartyPopper, Upload, CheckCircle2,
  XCircle, RotateCcw, Sparkles, User, Users, Briefcase, Home,
  Landmark, CircleDot, Target, Clock,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import {
  type JourneyState, type SectionId, initialJourney,
  CREDIT_QUESTIONS, VEHICLE_DOCS, JOURNEY_LENDERS, lenderLogo,
  creditFailed, ramzorBad, deriveTrack, needsVehicleAnswer, isDeadEnd,
  sectionComplete, currentSection, FIRST_CALL_SECTIONS,
} from "@/lib/journey";
import { Confetti } from "@/components/ui/Confetti";
import { cn, formatCurrency } from "@/lib/utils";

/* ============================================================
   LEAD CARD v4 — "הכל במסך אחד"
   כל השלבים גלויים · שום דבר לא נעול · תמיד ברור מה הבא.
   סדר Yoatsim: פתיחה → אשראי → פרטים → משפחה → הכנסות →
   נכסים → בנק → רמזור → חתימה → (שעה) → בדיקות/מסמכים →
   תוצאות → תשלום.
   ============================================================ */

export function LeadCardV3({ lead }: { lead: Lead }) {
  const storageKey = `bingo-journey-v2-${lead.id}`;
  const [j, setJ] = React.useState<JourneyState>(initialJourney);
  const [loaded, setLoaded] = React.useState(false);
  const [confetti, setConfetti] = React.useState(0);
  const [note, setNote] = React.useState("");
  const [showCallback, setShowCallback] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setJ({ ...initialJourney(), ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, [storageKey]);
  React.useEffect(() => {
    if (loaded) try { localStorage.setItem(storageKey, JSON.stringify(j)); } catch {}
  }, [j, loaded, storageKey]);

  const patch = React.useCallback((p: Partial<JourneyState>) => setJ((s) => ({ ...s, ...p })), []);
  const log = React.useCallback((text: string, kind = "system") => {
    setJ((s) => ({ ...s, timeline: [{ at: new Date().toISOString(), text, kind }, ...s.timeline] }));
  }, []);

  const track = deriveTrack(j);
  const disqualified = creditFailed(j) || ramzorBad(j);
  const askVehicle = needsVehicleAnswer(j);
  const deadEnd = isDeadEnd(j);
  const current = currentSection(j);
  const signed = !!j.signedAt;

  /* ---------- actions ---------- */
  function markSigned() {
    const now = new Date();
    const due = new Date(now.getTime() + 60 * 60 * 1000);
    patch({ signedAt: now.toISOString(), callbackDueAt: due.toISOString() });
    setConfetti((c) => c + 1);
    log("✍️ הלקוח חתם על הסכם התקשרות — נוצרה משימת חזרה אוטומטית בעוד שעה", "contract");
    scrollToSection("cooldown");
  }
  function startChecks() {
    patch({ checksStartedAt: new Date().toISOString() });
    log(track === "vehicle" ? "חזרה ללקוח — מבקשים 4 מסמכים" : "חזרה ללקוח — מתחילים בדיקות זכאות", "flow");
    scrollToSection(track === "vehicle" ? "docs" : "checks");
  }
  function finishChecks() {
    patch({ checksDone: true });
    log("הבדיקות הוזנו — משקפים תוצאות ללקוח", "checks");
    scrollToSection("results");
  }
  function chooseLender(key: string) {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ chosenLender: key, paymentDueAt: due.toISOString() });
    const name = JOURNEY_LENDERS.find((l) => l.key === key)?.name || key;
    log(`הלקוח בחר את ${name} — משימת תשלום נוצרה לעוד יומיים`, "flow");
    scrollToSection("closing");
  }
  function setApproval(amount: number, rate: number, months: number) {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ finalApproval: { amount, rate, months }, paymentDueAt: due.toISOString() });
    setConfetti((c) => c + 1);
    log(`🎉 אישור סופי: ${formatCurrency(amount)} · ${rate}% · ${months} חודשים`, "approval");
    scrollToSection("results");
  }
  function markPaid() {
    patch({ paidAt: new Date().toISOString() });
    setConfetti((c) => c + 1);
    log("💰 התשלום התקבל — העסקה הושלמה!", "payment");
  }
  function addNote() {
    if (!note.trim()) return;
    log(note.trim(), "note");
    setNote("");
  }

  function scrollToSection(id: string) {
    setTimeout(() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
  }

  /* section status helper */
  function status(id: SectionId): "done" | "current" | "todo" {
    if (sectionComplete(j, id)) return "done";
    return current === id ? "current" : "todo";
  }

  const nextMeta = FIRST_CALL_SECTIONS.find((s) => s.id === current);

  return (
    <div className="max-w-[1180px] space-y-4">
      <Confetti trigger={confetti} count={40} />

      {/* ============ STICKY IDENTITY + PROGRESS ============ */}
      <div className="sticky top-[60px] z-30 -mx-1 px-1 pb-1 bg-bingo-cream/95 backdrop-blur-sm">
        <div className="b-card px-5 py-3.5">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/leads" className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-600 shrink-0" aria-label="חזרה">
              <ChevronRight className="size-4" />
            </Link>
            <span className={cn("size-11 rounded-full flex items-center justify-center text-[17px] font-bold shrink-0",
              j.paidAt ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-700")}>
              {lead.fullName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[18px] font-bold text-bingo-black truncate">{lead.fullName}</h1>
                {j.ramzor && (
                  <span className={cn("b-chip text-[11px]", j.ramzor === "green" ? "b-chip-green" : j.ramzor === "yellow" ? "b-chip-orange" : "b-chip-red")}>
                    <span className={cn("size-2 rounded-full", j.ramzor === "green" ? "bg-bingo-green" : j.ramzor === "yellow" ? "bg-status-yellow" : "bg-status-red")} />
                    רמזור {j.ramzor === "green" ? "ירוק" : j.ramzor === "yellow" ? "צהוב" : "אדום"}
                  </span>
                )}
                {track === "general" && <span className="b-chip b-chip-green text-[11px]"><Banknote className="size-3" /> כל מטרה</span>}
                {track === "vehicle" && <span className="b-chip b-chip-blue text-[11px]"><Car className="size-3" /> מסלול רכב</span>}
                {track === "general" && j.hasVehicle === "yes" && (
                  <span className="b-chip b-chip-gray text-[11px]"><Car className="size-3" /> יש רכב — גיבוי</span>
                )}
              </div>
              <div className="text-[11.5px] text-bingo-gray-500 tabular-nums" dir="ltr">{lead.phone || "—"}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a href={`tel:${lead.phone}`} className="b-pill b-pill-green b-pill-sm"><Phone className="size-3.5" /> חייג</a>
              <button className="b-pill b-pill-ghost b-pill-sm hidden sm:inline-flex"><MessageCircle className="size-3.5" /> WhatsApp</button>
              <button onClick={() => setShowCallback(true)} className="b-pill b-pill-ghost b-pill-sm"><CalendarClock className="size-3.5" /> חזרה</button>
            </div>
          </div>

          {/* progress dots + what's next */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-bingo-gray-100">
            <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
              {FIRST_CALL_SECTIONS.map((s) => {
                const st = status(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    title={s.title}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition",
                      st === "done" ? "bg-bingo-green-light text-bingo-green-deep" :
                      st === "current" ? "bg-bingo-black text-white" :
                      "bg-bingo-gray-100 text-bingo-gray-400 hover:bg-bingo-gray-150"
                    )}
                  >
                    {st === "done" ? <Check className="size-3" strokeWidth={3} /> : <span>{s.num}</span>}
                    {s.short}
                  </button>
                );
              })}
            </div>
            {!signed && nextMeta && (
              <span className="text-[11.5px] font-semibold text-bingo-gray-500 whitespace-nowrap hidden md:block">
                עכשיו: <span className="text-bingo-black">{nextMeta.title}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-3.5">

          {/* ---------- 1. פתיחת שיחה ---------- */}
          <Section id="opening" num={1} title="פתיחת שיחה" subtitle='"כמה כסף אתה צריך ולמה?"' icon={<Target className="size-4" />} st={status("opening")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="סכום מבוקש (₪)">
                <input className="b-input" inputMode="numeric" placeholder="100,000" value={j.amountRequested || ""} onChange={(e) => patch({ amountRequested: e.target.value })} />
              </Field>
              <Field label="מטרת ההלוואה">
                <div className="flex flex-wrap gap-1.5">
                  {["סגירת חובות", "רכב", "שיפוץ", "אירוע", "עסק", "אחר"].map((p) => (
                    <button key={p} onClick={() => patch({ loanPurpose: p })}
                      className={cn("b-chip transition", j.loanPurpose === p ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150")}>
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          {/* ---------- 2. בדיקת אשראי ---------- */}
          <Section id="credit" num={2} title="בדיקת אשראי ראשונית" subtitle="5 שאלות — תשובה פוסלת מסומנת מיד" icon={<ShieldCheck className="size-4" />} st={status("credit")}>
            <div className="space-y-2">
              {CREDIT_QUESTIONS.map((q, i) => {
                const val = j.credit[q.id];
                const fails = val !== null && val === q.failsWhen;
                return (
                  <div key={q.id} className={cn(
                    "rounded-2xl border px-3.5 py-2.5 flex items-center justify-between gap-3 flex-wrap transition-colors",
                    fails ? "border-status-orange/50 bg-status-orange-soft/40" :
                    val !== null ? "border-bingo-green/30 bg-bingo-green-light/25" : "border-bingo-gray-150"
                  )}>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-bingo-black">{i + 1}. {q.text}</p>
                      {q.helper && <p className="text-[11px] text-bingo-gray-500">{q.helper}</p>}
                      {fails && <p className="text-[11.5px] font-semibold text-status-orange flex items-center gap-1 mt-0.5"><AlertTriangle className="size-3" /> פוסל מסלול כל מטרה</p>}
                    </div>
                    <div className="b-segment shrink-0">
                      <button data-active={val === "yes"} onClick={() => patch({ credit: { ...j.credit, [q.id]: "yes" } })}>כן</button>
                      <button data-active={val === "no"} onClick={() => patch({ credit: { ...j.credit, [q.id]: "no" } })}>לא</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* ---------- INLINE PIVOT: disqualified → ask about car NOW ---------- */}
          {askVehicle && (
            <div className="rounded-2xl border-2 border-bingo-blue/40 bg-status-blue-soft/50 p-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="b-icon b-icon-blue size-11 shrink-0"><Car className="size-5" /></span>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-bingo-blue uppercase tracking-wide mb-0.5">שאל עכשיו — אל תמשיך בלי תשובה</p>
                  <h3 className="text-[17px] font-bold text-bingo-black mb-3">"האם יש בבעלותך רכב?"</h3>
                  <div className="flex gap-2">
                    <button onClick={() => { patch({ hasVehicle: "yes" }); log("יש רכב 🚗 — ממשיכים במסלול הלוואה כנגד רכב", "flow"); }} className="b-pill b-pill-green b-pill-sm">
                      <Check className="size-4" strokeWidth={3} /> כן, יש רכב
                    </button>
                    <button onClick={() => { patch({ hasVehicle: "no" }); log("אין רכב — הליד לא זכאי", "flow"); }} className="b-pill b-pill-ghost b-pill-sm">אין רכב</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------- DEAD END ---------- */}
          {deadEnd && (
            <div className="rounded-2xl border border-bingo-gray-200 bg-bingo-gray-50 p-5 text-center animate-fade-in">
              <XCircle className="size-8 text-bingo-gray-300 mx-auto mb-2" />
              <p className="text-[15px] font-bold text-bingo-black">הליד לא זכאי — נפסל ואין רכב</p>
              <p className="text-[12.5px] text-bingo-gray-500 mt-1 mb-3">סמן יציאה או המשך אם בכל זאת רלוונטי</p>
              <button onClick={() => { patch({ exitReason: "לא זכאי — נפסל ואין רכב" }); log("הליד סומן כלא זכאי", "flow"); }} className="b-pill b-pill-dark b-pill-sm mx-auto">
                סמן כלא זכאי
              </button>
            </div>
          )}

          {/* ---------- 3. פרטים אישיים ---------- */}
          <Section id="personal" num={3} title="פרטים אישיים" icon={<User className="size-4" />} st={status("personal")}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Field label="תעודת זהות">
                <input className="b-input" inputMode="numeric" placeholder="123456789" value={j.idNumber ?? (lead.idNumber || "")} onChange={(e) => patch({ idNumber: e.target.value })} />
              </Field>
              <Field label="שנת לידה">
                <input className="b-input" inputMode="numeric" placeholder="1985" value={j.birthYear || ""} onChange={(e) => patch({ birthYear: e.target.value })} />
              </Field>
              <Field label="מין">
                <div className="b-segment w-full">
                  <button className="flex-1" data-active={j.gender === "male"} onClick={() => patch({ gender: "male" })}>זכר</button>
                  <button className="flex-1" data-active={j.gender === "female"} onClick={() => patch({ gender: "female" })}>נקבה</button>
                </div>
              </Field>
            </div>
          </Section>

          {/* ---------- 4. מצב משפחתי ---------- */}
          <Section id="family" num={4} title="מצב משפחתי" icon={<Users className="size-4" />} st={status("family")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="סטטוס">
                <div className="flex flex-wrap gap-1.5">
                  {["נשוי/אה", "רווק/ה", "גרוש/ה", "אלמן/ה"].map((s) => (
                    <button key={s} onClick={() => patch({ familyStatus: s })}
                      className={cn("b-chip transition", j.familyStatus === s ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150")}>{s}</button>
                  ))}
                </div>
              </Field>
              <Field label="ילדים מתחת ל-18">
                <input className="b-input" inputMode="numeric" placeholder="0" value={j.children || ""} onChange={(e) => patch({ children: e.target.value })} />
              </Field>
            </div>
          </Section>

          {/* ---------- 5. תעסוקה והכנסות ---------- */}
          <Section id="income" num={5} title="תעסוקה והכנסות" icon={<Briefcase className="size-4" />} st={status("income")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="תעסוקה">
                <div className="b-segment w-full">
                  {["שכיר", "עצמאי", "פנסיונר"].map((o) => (
                    <button key={o} className="flex-1" data-active={j.employment === o} onClick={() => patch({ employment: o })}>{o}</button>
                  ))}
                </div>
              </Field>
              <Field label="ותק (שנים)">
                <input className="b-input" inputMode="numeric" placeholder="3" value={j.seniorityYears || ""} onChange={(e) => patch({ seniorityYears: e.target.value })} />
              </Field>
              <Field label="הכנסה חודשית נטו (₪)">
                <input className="b-input" inputMode="numeric" placeholder="12,000" value={j.monthlyIncome || ""} onChange={(e) => patch({ monthlyIncome: e.target.value })} />
              </Field>
              <Field label="הכנסת בן/בת זוג (₪)">
                <input className="b-input" inputMode="numeric" placeholder="אופציונלי" value={j.spouseIncome || ""} onChange={(e) => patch({ spouseIncome: e.target.value })} />
              </Field>
            </div>
          </Section>

          {/* ---------- 6. נכסים ורכב ---------- */}
          <Section id="assets" num={6} title="נכסים ורכב" subtitle="הרכב הוא הגיבוי — תמיד לשאול" icon={<Home className="size-4" />} st={status("assets")}>
            <div className="space-y-3.5">
              <Field label="דירה בבעלות?">
                <div className="b-segment w-full">
                  <button className="flex-1" data-active={j.hasProperty === "yes"} onClick={() => patch({ hasProperty: "yes" })}>כן, נקייה</button>
                  <button className="flex-1" data-active={j.hasProperty === "yes-mortgaged"} onClick={() => patch({ hasProperty: "yes-mortgaged" })}>עם משכנתא</button>
                  <button className="flex-1" data-active={j.hasProperty === "no"} onClick={() => patch({ hasProperty: "no" })}>אין</button>
                </div>
              </Field>
              <Field label="רכב בבעלות?">
                <div className="b-segment w-full">
                  <button className="flex-1" data-active={j.hasVehicle === "yes"} onClick={() => patch({ hasVehicle: "yes" })}>כן</button>
                  <button className="flex-1" data-active={j.hasVehicle === "no"} onClick={() => patch({ hasVehicle: "no" })}>אין</button>
                </div>
              </Field>
              {j.hasVehicle === "yes" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-fade-in">
                  <Field label="שנת ייצור">
                    <input className="b-input" inputMode="numeric" placeholder="2020" value={j.vehicleYear || ""} onChange={(e) => patch({ vehicleYear: e.target.value })} />
                  </Field>
                  <Field label="יצרן ודגם">
                    <input className="b-input" placeholder="טויוטה קורולה" value={j.vehicleMake || ""} onChange={(e) => patch({ vehicleMake: e.target.value })} />
                  </Field>
                  <Field label="נקי משעבוד?">
                    <div className="b-segment w-full">
                      <button className="flex-1" data-active={j.vehicleFree === "yes"} onClick={() => patch({ vehicleFree: "yes" })}>נקי</button>
                      <button className="flex-1" data-active={j.vehicleFree === "no"} onClick={() => patch({ vehicleFree: "no" })}>משועבד</button>
                    </div>
                  </Field>
                </div>
              )}
            </div>
          </Section>

          {/* ---------- 7. בנק ---------- */}
          <Section id="bank" num={7} title="פרטי בנק" icon={<Landmark className="size-4" />} st={status("bank")}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Field label="בנק">
                <input className="b-input" placeholder="הפועלים" value={j.bankName || ""} onChange={(e) => patch({ bankName: e.target.value })} />
              </Field>
              <Field label="סניף">
                <input className="b-input" inputMode="numeric" placeholder="612" value={j.bankBranch || ""} onChange={(e) => patch({ bankBranch: e.target.value })} />
              </Field>
              <Field label="מספר חשבון">
                <input className="b-input" inputMode="numeric" placeholder="123456" value={j.bankAccount || ""} onChange={(e) => patch({ bankAccount: e.target.value })} />
              </Field>
            </div>
          </Section>

          {/* ---------- 8. רמזור ---------- */}
          <Section id="ramzor" num={8} title="בדיקת רמזור" subtitle="חיווי אשראי בנק ישראל — צהוב/אדום פוסל כל מטרה" icon={<CircleDot className="size-4" />} st={status("ramzor")}>
            <div className="grid grid-cols-3 gap-2.5">
              {([
                { v: "green",  label: "ירוק — תקין", dot: "bg-bingo-green",  on: "border-bingo-green bg-bingo-green-light/60 text-bingo-green-deep" },
                { v: "yellow", label: "צהוב",         dot: "bg-status-yellow", on: "border-status-yellow bg-status-yellow-soft text-[#8a6d00]" },
                { v: "red",    label: "אדום",          dot: "bg-status-red",    on: "border-status-red bg-status-red-soft text-status-red" },
              ] as const).map((o) => (
                <button key={o.v} onClick={() => patch({ ramzor: o.v })}
                  className={cn("h-14 rounded-2xl border-2 font-bold text-[13.5px] transition-all flex items-center justify-center gap-2",
                    j.ramzor === o.v ? o.on + " scale-[1.02]" : "border-bingo-gray-150 bg-white text-bingo-gray-500 hover:border-bingo-gray-300")}>
                  <span className={cn("size-3.5 rounded-full", o.dot)} />
                  {o.label}
                </button>
              ))}
            </div>
          </Section>

          {/* ---------- 9. הסכם התקשרות ---------- */}
          <Section id="contract" num={9} title="הסכם התקשרות" subtitle={track === "vehicle" ? "מסלול רכב" : "מסלול כל מטרה"} icon={<FileSignature className="size-4" />} st={status("contract")}>
            {!j.contractSentAt ? (
              <div className="flex items-center gap-2.5">
                <button onClick={() => { patch({ contractSentAt: new Date().toISOString(), contractSentVia: "whatsapp" }); log("הסכם נשלח ב-WhatsApp", "contract"); }} className="b-pill b-pill-green flex-1">
                  <MessageCircle className="size-4" /> שלח ב-WhatsApp
                </button>
                <button onClick={() => { patch({ contractSentAt: new Date().toISOString(), contractSentVia: "sms" }); log("הסכם נשלח ב-SMS", "contract"); }} className="b-pill b-pill-ghost flex-1">
                  <Send className="size-4" /> שלח ב-SMS
                </button>
              </div>
            ) : !signed ? (
              <div className="space-y-3">
                <p className="text-[12.5px] font-semibold text-bingo-green-dark flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> נשלח ב-{j.contractSentVia === "whatsapp" ? "WhatsApp" : "SMS"} · ממתין לחתימה
                </p>
                <button onClick={markSigned} className="b-pill b-pill-green b-pill-lg w-full">
                  <FileSignature className="size-5" /> הלקוח חתם ✓
                </button>
              </div>
            ) : (
              <p className="text-[13.5px] font-bold text-bingo-green-dark flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                נחתם ב-{new Date(j.signedAt!).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} — משימת חזרה נוצרה אוטומטית
              </p>
            )}
          </Section>

          {/* ============ POST-SIGNATURE — appears on the same page ============ */}
          {signed && (
            <>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-bingo-gray-200" />
                <span className="b-eyebrow">אחרי החתימה</span>
                <div className="flex-1 h-px bg-bingo-gray-200" />
              </div>

              {/* המתנה של שעה */}
              <CooldownSection j={j} onReady={startChecks} track={track} done={!!j.checksStartedAt} />

              {/* בדיקות (כל מטרה) */}
              {j.checksStartedAt && track !== "vehicle" && (
                <ChecksSection j={j} patch={patch} onFinish={finishChecks} />
              )}

              {/* מסמכים (רכב) */}
              {j.checksStartedAt && track === "vehicle" && (
                <DocsSection j={j} patch={patch} log={log} onApproval={setApproval} />
              )}

              {/* תוצאות */}
              {(j.checksDone || j.finalApproval) && (
                <ResultsSection j={j} track={track} onChoose={chooseLender} onVehicleOk={() => { patch({ loanArrived: false, paymentDueAt: new Date(Date.now() + 2 * 86400000).toISOString() }); log("האישור הוצג ללקוח — ממתין להלוואה", "flow"); scrollToSection("closing"); }} />
              )}

              {/* תשלום וסגירה */}
              {(j.chosenLender || (track === "vehicle" && j.finalApproval)) && (
                <ClosingSection j={j} patch={patch} onPaid={markPaid} />
              )}
            </>
          )}
        </div>

        {/* -------- SIDE RAIL -------- */}
        <div className="space-y-4 lg:sticky lg:top-[196px]">
          <section className="b-card p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="b-icon b-icon-gray size-8"><StickyNote className="size-4" /></span>
              <h3 className="text-[13.5px] font-bold text-bingo-black">הערה מהירה</h3>
            </div>
            <div className="flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="כתוב ולחץ Enter..." className="b-input h-10 text-[13px]" />
              <button onClick={addNote} className="b-pill b-pill-dark b-pill-sm shrink-0">שמור</button>
            </div>
          </section>

          <section className="b-card p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13.5px] font-bold text-bingo-black">ציר זמן</h3>
              <button onClick={() => { if (confirm("לאפס את המסע?")) setJ(initialJourney()); }} className="text-[11px] text-bingo-gray-400 hover:text-bingo-gray-600 inline-flex items-center gap-1">
                <RotateCcw className="size-3" /> אפס
              </button>
            </div>
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {j.timeline.length === 0 && <p className="text-[12px] text-bingo-gray-400 text-center py-3">כל פעולה תתועד כאן</p>}
              {j.timeline.map((t, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className={cn("size-2 rounded-full mt-1.5 shrink-0",
                    t.kind === "note" ? "bg-status-blue" :
                    t.kind === "approval" || t.kind === "payment" ? "bg-bingo-green" :
                    t.kind === "contract" ? "bg-status-purple" : "bg-bingo-gray-300")} />
                  <div className="min-w-0">
                    <p className="text-[12px] text-bingo-black leading-snug">{t.text}</p>
                    <p className="text-[10px] text-bingo-gray-400 tabular-nums">
                      {new Date(t.at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {showCallback && (
        <CallbackModal onClose={() => setShowCallback(false)} onSet={(when, txt) => { log(`⏰ נקבעה חזרה: ${when}${txt ? ` — ${txt}` : ""}`, "note"); setShowCallback(false); }} />
      )}
    </div>
  );
}

/* ============================================================
   SECTION SHELL — always open, always editable, status ring
   ============================================================ */
function Section({ id, num, title, subtitle, icon, st, children }: {
  id: string; num: number; title: string; subtitle?: string;
  icon: React.ReactNode; st: "done" | "current" | "todo"; children: React.ReactNode;
}) {
  return (
    <section id={`sec-${id}`} className={cn(
      "b-card p-5 transition-all scroll-mt-[210px]",
      st === "current" && "ring-2 ring-bingo-green/50",
      st === "todo" && "opacity-80"
    )}>
      <header className="flex items-center gap-3 mb-4">
        <span className={cn("size-9 rounded-full flex items-center justify-center text-[13.5px] font-bold shrink-0 transition-colors",
          st === "done" ? "bg-bingo-green text-bingo-black" :
          st === "current" ? "bg-bingo-black text-white" :
          "bg-bingo-gray-100 text-bingo-gray-400")}>
          {st === "done" ? <Check className="size-4.5" strokeWidth={3} /> : num}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-bold text-bingo-black flex items-center gap-2">
            {title}
            {st === "current" && <span className="b-chip b-chip-green text-[10px] py-0.5">כאן עכשיו</span>}
          </h2>
          {subtitle && <p className="text-[12px] text-bingo-gray-500">{subtitle}</p>}
        </div>
        <span className="text-bingo-gray-300">{icon}</span>
      </header>
      {children}
    </section>
  );
}

/* ============================================================
   POST-SIGNATURE SECTIONS
   ============================================================ */
function CooldownSection({ j, onReady, track, done }: { j: JourneyState; onReady: () => void; track: string | null; done: boolean }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (done) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [done]);
  const due = j.callbackDueAt ? new Date(j.callbackDueAt).getTime() : now;
  const remain = Math.max(0, due - now);
  const ready = remain === 0;
  const mm = String(Math.floor(remain / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");

  return (
    <section id="sec-cooldown" className={cn("b-card p-5 scroll-mt-[210px]", !done && "ring-2 ring-status-orange/40")}>
      <div className="flex items-center gap-4 flex-wrap">
        <span className={cn("b-icon size-12 shrink-0", done ? "b-icon-green" : "b-icon-orange")}><AlarmClock className="size-6" /></span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-bold text-bingo-black">
            {done ? "החזרה בוצעה ✓" : ready ? "הגיע הזמן — חזור ללקוח!" : "חזרה ללקוח בעוד"}
          </h2>
          <p className="text-[12px] text-bingo-gray-500">
            {track === "vehicle" ? "בשיחה: בקש 4 מסמכים (רישיון רכב, ת.ז, רישיון נהיגה, אישור ניהול חשבון)" : "בשיחה: מריצים בדיקות זכאות בכל הגופים"}
          </p>
        </div>
        {!done && (
          <>
            {!ready && <span className="font-mono text-[32px] font-bold text-bingo-black tabular-nums">{mm}:{ss}</span>}
            <button onClick={onReady} className={cn("b-pill", ready ? "b-pill-green animate-pulse-green" : "b-pill-ghost")}>
              <Phone className="size-4" /> {ready ? "התקשר עכשיו" : "הלקוח זמין — דלג"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function ChecksSection({ j, patch, onFinish }: { j: JourneyState; patch: (p: Partial<JourneyState>) => void; onFinish: () => void }) {
  const answered = JOURNEY_LENDERS.filter((l) => ["approved", "rejected"].includes(j.lenderResults[l.key]?.outcome as string)).length;
  function setResult(key: string, r: Partial<import("@/lib/journey").LenderResult>) {
    patch({ lenderResults: { ...j.lenderResults, [key]: { ...(j.lenderResults[key] || { outcome: null }), ...r } } });
  }
  return (
    <section id="sec-checks" className={cn("b-card p-5 scroll-mt-[210px]", !j.checksDone && "ring-2 ring-bingo-green/50")}>
      <header className="flex items-center gap-3 mb-4">
        <span className="b-icon b-icon-green size-11"><ShieldCheck className="size-5" /></span>
        <div className="flex-1">
          <h2 className="text-[16px] font-bold text-bingo-black">בדיקות זכאות — כל הגופים</h2>
          <p className="text-[12px] text-bingo-gray-500">הוזנו {answered}/{JOURNEY_LENDERS.length}</p>
        </div>
        {!j.checksDone && (
          <button onClick={onFinish} disabled={answered === 0} className={cn("b-pill b-pill-sm", answered > 0 ? "b-pill-dark" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
            סיים ושקף ללקוח
          </button>
        )}
      </header>
      <div className="space-y-2">
        {JOURNEY_LENDERS.map((l) => {
          const r = j.lenderResults[l.key];
          const st = r?.outcome ?? null;
          return (
            <div key={l.key} className={cn("rounded-2xl border px-3.5 py-2.5 transition-colors",
              st === "approved" ? "border-bingo-green/40 bg-bingo-green-light/25" :
              st === "rejected" ? "border-bingo-gray-150 bg-bingo-gray-50 opacity-70" : "border-bingo-gray-150")}>
              <div className="flex items-center gap-3 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lenderLogo(l.domain)} alt={l.name} className="size-8 rounded-lg border border-bingo-gray-150 bg-white object-contain p-0.5 shrink-0" />
                <span className="text-[13.5px] font-bold text-bingo-black flex-1 min-w-0">{l.name}</span>
                <div className="b-segment shrink-0">
                  <button data-active={st === "approved"} onClick={() => setResult(l.key, { outcome: "approved" })}>אושר</button>
                  <button data-active={st === "rejected"} onClick={() => setResult(l.key, { outcome: "rejected" })}>נדחה</button>
                </div>
              </div>
              {st === "approved" && (
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  <input className="b-input h-9 text-[12.5px]" inputMode="numeric" placeholder="סכום ₪" value={r?.amount ?? ""} onChange={(e) => setResult(l.key, { amount: e.target.value ? Number(e.target.value) : null })} />
                  <input className="b-input h-9 text-[12.5px]" inputMode="decimal" placeholder="ריבית %" value={r?.rate ?? ""} onChange={(e) => setResult(l.key, { rate: e.target.value ? Number(e.target.value) : null })} />
                  <input className="b-input h-9 text-[12.5px]" inputMode="numeric" placeholder="חודשים" value={r?.months ?? ""} onChange={(e) => setResult(l.key, { months: e.target.value ? Number(e.target.value) : null })} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DocsSection({ j, patch, log, onApproval }: {
  j: JourneyState; patch: (p: Partial<JourneyState>) => void;
  log: (t: string, k?: string) => void;
  onApproval: (a: number, r: number, m: number) => void;
}) {
  const received = VEHICLE_DOCS.filter((d) => j.docsReceived[d.id]).length;
  const all = received === VEHICLE_DOCS.length;
  const [amount, setAmount] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [months, setMonths] = React.useState("");

  return (
    <section id="sec-docs" className={cn("b-card p-5 scroll-mt-[210px]", !j.finalApproval && "ring-2 ring-bingo-blue/40")}>
      <header className="flex items-center gap-3 mb-4">
        <span className="b-icon b-icon-blue size-11"><Upload className="size-5" /></span>
        <div>
          <h2 className="text-[16px] font-bold text-bingo-black">מסמכים — מסלול רכב</h2>
          <p className="text-[12px] text-bingo-gray-500">התקבלו {received}/4</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {VEHICLE_DOCS.map((d) => {
          const got = !!j.docsReceived[d.id];
          return (
            <button key={d.id} onClick={() => patch({ docsReceived: { ...j.docsReceived, [d.id]: !got } })}
              className={cn("rounded-2xl border-2 px-3.5 py-3 flex items-center gap-2.5 text-right transition-all",
                got ? "border-bingo-green bg-bingo-green-light/40" : "border-bingo-gray-150 hover:border-bingo-gray-300")}>
              <span className={cn("size-6 rounded-full flex items-center justify-center shrink-0", got ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-400")}>
                {got ? <Check className="size-3.5" strokeWidth={3} /> : <Clock className="size-3" />}
              </span>
              <span className="text-[13px] font-semibold text-bingo-black">{d.label}</span>
            </button>
          );
        })}
      </div>
      {!j.docsUploadedAt ? (
        <button onClick={() => { patch({ docsUploadedAt: new Date().toISOString() }); log("המסמכים הועלו לגוף המימון — אישור תוך דקות", "docs"); }} disabled={!all}
          className={cn("b-pill w-full", all ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          <Upload className="size-4" /> הכל התקבל — העלה לגוף המימון
        </button>
      ) : !j.finalApproval ? (
        <div className="rounded-2xl border border-bingo-green/40 bg-bingo-green-light/25 p-4">
          <p className="text-[13px] font-bold text-bingo-black mb-2.5 flex items-center gap-1.5">
            <Sparkles className="size-4 text-bingo-green-dark" /> הועלה — כשמגיע האישור הסופי הזן אותו:
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <input className="b-input h-10" inputMode="numeric" placeholder="סכום ₪" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className="b-input h-10" inputMode="decimal" placeholder="ריבית %" value={rate} onChange={(e) => setRate(e.target.value)} />
            <input className="b-input h-10" inputMode="numeric" placeholder="חודשים" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <button onClick={() => onApproval(Number(amount), Number(rate), Number(months))} disabled={!amount}
            className={cn("b-pill w-full", amount ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
            <Trophy className="size-4" /> התקבל אישור סופי!
          </button>
        </div>
      ) : (
        <p className="text-[13.5px] font-bold text-bingo-green-dark flex items-center gap-2">
          <CheckCircle2 className="size-4" /> אישור סופי: {formatCurrency(j.finalApproval.amount || 0)} · {j.finalApproval.rate}% · {j.finalApproval.months} חודשים
        </p>
      )}
    </section>
  );
}

function ResultsSection({ j, track, onChoose, onVehicleOk }: { j: JourneyState; track: string | null; onChoose: (k: string) => void; onVehicleOk: () => void }) {
  if (track === "vehicle") {
    const a = j.finalApproval;
    return (
      <section id="sec-results" className="b-card p-5 scroll-mt-[210px] border-2 border-bingo-green/40">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="b-icon b-icon-green size-12"><Trophy className="size-6" /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-bingo-black">שקף ללקוח את האישור 🎉</h2>
            <p className="text-[20px] font-bold text-bingo-green-dark tabular-nums">
              {a?.amount ? formatCurrency(a.amount) : "—"} <span className="text-[13px] text-bingo-gray-500 font-medium">· {a?.rate}% · {a?.months} תשלומים</span>
            </p>
          </div>
          <button onClick={onVehicleOk} className="b-pill b-pill-green"><Check className="size-4" strokeWidth={3} /> הלקוח מאשר</button>
        </div>
      </section>
    );
  }
  const offers = JOURNEY_LENDERS.map((l) => ({ ...l, r: j.lenderResults[l.key] }))
    .filter((l) => l.r?.outcome === "approved")
    .sort((a, b) => (b.r?.amount || 0) - (a.r?.amount || 0));
  return (
    <section id="sec-results" className={cn("b-card p-5 scroll-mt-[210px]", !j.chosenLender && "ring-2 ring-bingo-green/50")}>
      <header className="flex items-center gap-3 mb-4">
        <span className="b-icon b-icon-green size-11"><Trophy className="size-5" /></span>
        <div>
          <h2 className="text-[16px] font-bold text-bingo-black">שיקוף תוצאות ללקוח</h2>
          <p className="text-[12px] text-bingo-gray-500">{offers.length ? `${offers.length} אישורים — בחרו יחד` : "אין אישורים"}</p>
        </div>
      </header>
      {offers.length ? (
        <div className="space-y-2">
          {offers.map((o, i) => (
            <div key={o.key} className={cn("rounded-2xl border px-3.5 py-3 flex items-center gap-3 flex-wrap",
              j.chosenLender === o.key ? "border-bingo-green bg-bingo-green-light/40" :
              i === 0 ? "border-bingo-green/40 bg-bingo-green-light/20" : "border-bingo-gray-150")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lenderLogo(o.domain)} alt={o.name} className="size-9 rounded-lg border border-bingo-gray-150 bg-white object-contain p-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-bingo-black">{o.name}</span>
                  {i === 0 && !j.chosenLender && <span className="b-chip b-chip-green text-[10px] py-0.5">הטובה ביותר</span>}
                  {j.chosenLender === o.key && <span className="b-chip b-chip-green text-[10px] py-0.5">✓ נבחרה</span>}
                </div>
                <span className="text-[12.5px] text-bingo-gray-500 tabular-nums">
                  {o.r?.amount ? formatCurrency(o.r.amount) : "—"} · {o.r?.rate ?? "—"}% · {o.r?.months ?? "—"} חודשים
                </span>
              </div>
              {!j.chosenLender && <button onClick={() => onChoose(o.key)} className="b-pill b-pill-dark b-pill-sm">הלקוח בחר</button>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-bingo-gray-200 p-6 text-center">
          <p className="text-[13px] text-bingo-gray-500">
            כל הגופים דחו. {j.hasVehicle === "yes" ? "🚗 יש רכב — הצע מסלול רכב!" : "בדוק אם יש רכב."}
          </p>
        </div>
      )}
    </section>
  );
}

function ClosingSection({ j, patch, onPaid }: { j: JourneyState; patch: (p: Partial<JourneyState>) => void; onPaid: () => void }) {
  const dueTxt = j.paymentDueAt ? new Date(j.paymentDueAt).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }) : "";
  if (j.paidAt) {
    return (
      <section id="sec-closing" className="b-card p-6 scroll-mt-[210px] border-2 border-bingo-green/50 text-center">
        <span className="b-icon b-icon-green size-14 mx-auto mb-2"><PartyPopper className="size-7" /></span>
        <h2 className="text-[20px] font-bold text-bingo-black">העסקה הושלמה! 🎉</h2>
        <p className="text-[13px] text-bingo-gray-500 mt-1">עמלה: {j.feeAmount} ₪</p>
        <Link href="/dialer/cockpit" className="b-pill b-pill-dark mx-auto mt-4 inline-flex"><Phone className="size-4" /> ללקוח הבא</Link>
      </section>
    );
  }
  return (
    <section id="sec-closing" className={cn("b-card p-5 scroll-mt-[210px] ring-2 ring-bingo-green/40")}>
      <header className="flex items-center gap-3 mb-4">
        <span className="b-icon b-icon-green size-11"><Banknote className="size-5" /></span>
        <div>
          <h2 className="text-[16px] font-bold text-bingo-black">ממתין להלוואה → תשלום</h2>
          <p className="text-[12px] text-bingo-gray-500">⏰ משימת תשלום אוטומטית: <b className="text-bingo-black">{dueTxt}</b></p>
        </div>
      </header>
      <div className="flex items-end gap-2.5 max-w-md">
        <Field label="עמלת בינגו (₪)">
          <input className="b-input" inputMode="numeric" placeholder="2,500" value={j.feeAmount || ""} onChange={(e) => patch({ feeAmount: e.target.value })} />
        </Field>
        <button onClick={onPaid} disabled={!j.feeAmount} className={cn("b-pill shrink-0", j.feeAmount ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          <CheckCircle2 className="size-4" /> התשלום התקבל
        </button>
      </div>
    </section>
  );
}

/* ============ SHARED ============ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <label className="block text-[12px] font-semibold text-bingo-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CallbackModal({ onClose, onSet }: { onClose: () => void; onSet: (when: string, note: string) => void }) {
  const [note, setNote] = React.useState("");
  const options = ["בעוד שעה", "בעוד 3 שעות", "מחר בבוקר (10:00)", "בעוד יומיים"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-black/40 p-4" onClick={onClose}>
      <div className="b-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[16px] font-bold text-bingo-black mb-1">קבע חזרה ללקוח</h3>
        <p className="text-[12px] text-bingo-gray-500 mb-3.5">תיווצר משימה בלוח המשימות שלך</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {options.map((o) => (
            <button key={o} onClick={() => onSet(o, note)} className="b-pill b-pill-ghost b-pill-sm">{o}</button>
          ))}
        </div>
        <input className="b-input h-10 text-[13px] mb-3" placeholder="הערה (אופציונלי)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={onClose} className="text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600 w-full text-center">ביטול</button>
      </div>
    </div>
  );
}
