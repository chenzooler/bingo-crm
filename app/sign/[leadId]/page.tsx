"use client";
import * as React from "react";
import { use } from "react";
import { CheckCircle2, FileSignature, Shield, Lock, Smartphone, Eye, AlertTriangle, ChevronLeft, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

// Public-facing signature page — what the customer sees from WhatsApp/SMS link
export default function SignPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params);
  const [step, setStep] = React.useState<"review" | "sign" | "verify" | "done">("review");
  const [otpCode, setOtpCode] = React.useState("");
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const [reading, setReading] = React.useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawingRef = React.useRef(false);

  // Simulated lead data (in production, fetched by leadId)
  const lead = {
    name: "מאג'ד אל' חואסה",
    idNumber: "061325379",
    amount: 250000,
    interest: "6.4%",
    months: 60,
    monthlyPayment: 4870,
    lender: "בנק ירושלים",
    brokerFee: 2500,
  };

  // Reading progress bar — fakes scrolling through terms
  React.useEffect(() => {
    if (step !== "review") return;
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setReading(Math.min(100, (scrolled / total) * 100));
    };
    window.addEventListener("scroll", handler);
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [step]);

  // Drawing pad
  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#2EA10D";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const { x, y } = getCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }
  function stopDraw() { drawingRef.current = false; }
  function clearPad() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }
  function getCoords(e: any, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = e.touches ? e.touches[0] : e;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  }

  function sendOTP() {
    setStep("verify");
  }

  function verifyOTP() {
    if (otpCode.length === 4) {
      setStep("done");
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: "#F5F5F7", fontFamily: '"Heebo", "Assistant", system-ui, sans-serif' }} dir="rtl">
      {/* Top brand bar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center font-black text-slate-900 text-lg shadow-lg shadow-green-500/30">B</div>
            <div>
              <div className="font-black text-[15px] text-slate-900">בינגו ישראל</div>
              <div className="text-[10px] text-slate-500 -mt-0.5">מימון בול בשבילך</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <Shield className="size-3.5" />
            חתימה מאובטחת
          </div>
        </div>
        {step === "review" && (
          <div className="h-1 bg-slate-200">
            <div className="h-full bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 transition-all duration-150" style={{ width: `${reading}%` }} />
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 pb-32">
        {/* STEP 1: REVIEW */}
        {step === "review" && (
          <>
            {/* Welcome */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-16 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-600 text-white mb-3 shadow-xl shadow-green-500/40">
                <FileSignature className="size-8" />
              </div>
              <h1 className="text-[28px] font-black text-slate-900 tracking-tight">
                שלום <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-green-600 to-emerald-700">{lead.name.split(" ")[0]}</span> 👋
              </h1>
              <p className="text-[14px] text-slate-600 mt-2">
                אישרת אישור עקרוני! לפניך החוזה הסופי לחתימה דיגיטלית.
              </p>
            </div>

            {/* Loan summary card */}
            <div className="bg-white rounded-3xl border-2 border-bingo-green/30 p-5 shadow-xl shadow-green-500/10 mb-5">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-3">תקציר ההלוואה שלך</div>
              <div className="text-center mb-4 pb-4 border-b border-slate-100">
                <div className="text-[12px] text-slate-500">סכום הלוואה</div>
                <div className="text-[42px] font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-green-600 to-emerald-700 tabular-nums leading-tight">{lead.amount.toLocaleString()}<span className="text-[24px]">₪</span></div>
                <div className="text-[12px] text-slate-500">מ-{lead.lender}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SummaryItem label="ריבית שנתית" value={lead.interest} />
                <SummaryItem label="תקופה" value={`${lead.months} חודשים`} />
                <SummaryItem label="תשלום חודשי" value={`₪${lead.monthlyPayment.toLocaleString()}`} highlight />
                <SummaryItem label="עמלת בינגו" value={`₪${lead.brokerFee.toLocaleString()}`} />
              </div>
            </div>

            {/* Terms */}
            <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-5">
              <h2 className="text-[18px] font-black text-slate-900 mb-3 flex items-center gap-2">
                <Eye className="size-4 text-emerald-600" />
                תנאי ההסכם
              </h2>
              <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>1. הסכם זה נחתם בין <b>{lead.name}</b> (ת.ז {lead.idNumber}) לבין <b>בינגו ישראל - יועצי אשראי בע"מ</b>.</p>
                <p>2. בינגו פועלת כיועץ ומתווך לקבלת הלוואה בסך <b>₪{lead.amount.toLocaleString()}</b> מ-{lead.lender}.</p>
                <p>3. עמלת ייעוץ ותיווך: <b>₪{lead.brokerFee.toLocaleString()}</b>, תשולם בהעברת הלוואה.</p>
                <p>4. הלקוח מצהיר כי קרא והבין את תנאי ההלוואה לרבות שיעור הריבית, התקופה, וגובה ההחזר החודשי.</p>
                <p>5. בכפוף לאישור סופי מהגוף המלווה, ולעמידת הלקוח בדרישות.</p>
                <p>6. הלקוח רשאי לבטל הסכם זה תוך 14 ימים מיום החתימה (חוק הגנת הצרכן).</p>
                <p>7. כל הצדדים מאשרים כי החתימה הדיגיטלית קבילה כמשפטית מחייבת כדין.</p>
              </div>
            </section>

            {/* Smileys / KYC reminder */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-5 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-amber-900">חשוב לדעת</div>
                <div className="text-[12px] text-amber-800 mt-0.5 leading-relaxed">
                  ההלוואה כפופה לאישור סופי מהגוף המלווה. עיכובים עלולים לקרות בשל בדיקות KYC.
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 shadow-2xl">
              <div className="max-w-2xl mx-auto flex items-center gap-3">
                <div className="text-[11px] text-slate-500">
                  קראת <span className="font-black text-emerald-700">{Math.round(reading)}%</span> מההסכם
                </div>
                <button
                  onClick={() => setStep("sign")}
                  className="flex-1 h-14 rounded-2xl text-white text-[15px] font-black inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(180deg, #B5FF8C 0%, #50FF0A 50%, #2EA10D 100%)",
                    color: "#0F2A04",
                    boxShadow: `inset 0 2px 0 0 rgba(255,255,255,0.5), 0 4px 16px -2px rgba(80,255,10,0.5)`,
                  }}
                >
                  המשך לחתימה
                  <ChevronLeft className="size-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: DRAWING SIGNATURE */}
        {step === "sign" && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-16 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-600 text-white mb-3 shadow-xl shadow-green-500/40">
                <FileSignature className="size-8" />
              </div>
              <h1 className="text-[26px] font-black text-slate-900 tracking-tight">חתימה דיגיטלית</h1>
              <p className="text-[13px] text-slate-600 mt-2">חתום על המסך באצבע או בעכבר</p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-bingo-green/30 p-5 shadow-xl shadow-green-500/10">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">חתימה בכאן ↓</div>
              <div className="relative bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden" style={{ height: "240px" }}>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={400}
                  className="w-full h-full touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-[14px] font-bold">
                    חתום כאן ✍️
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <button onClick={clearPad} className="text-[12px] font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                  <RotateCcw className="size-3" />
                  נקה ותתחיל מחדש
                </button>
                <div className="text-[10px] text-slate-400">
                  {lead.name} · {new Date().toLocaleDateString("he-IL")}
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 shadow-2xl">
              <div className="max-w-2xl mx-auto flex items-center gap-3">
                <button
                  onClick={() => setStep("review")}
                  className="h-12 px-4 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold hover:bg-slate-200"
                >
                  חזור
                </button>
                <button
                  onClick={sendOTP}
                  disabled={!hasDrawn}
                  className="flex-1 h-14 rounded-2xl text-[15px] font-black inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: hasDrawn ? "linear-gradient(180deg, #B5FF8C 0%, #50FF0A 50%, #2EA10D 100%)" : "#CBD5E1",
                    color: hasDrawn ? "#0F2A04" : "#64748B",
                    boxShadow: hasDrawn ? `inset 0 2px 0 0 rgba(255,255,255,0.5), 0 4px 16px -2px rgba(80,255,10,0.5)` : "none",
                  }}
                >
                  אישור חתימה
                  <ChevronLeft className="size-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: SMS OTP VERIFY */}
        {step === "verify" && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-16 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white mb-3 shadow-xl shadow-blue-500/40">
                <Smartphone className="size-8" />
              </div>
              <h1 className="text-[26px] font-black text-slate-900 tracking-tight">אימות זהות</h1>
              <p className="text-[13px] text-slate-600 mt-2">
                שלחנו קוד 4 ספרות ל-<b>050-***-1877</b><br/>
                <span className="text-[11px] text-slate-500">הקוד תקף ל-5 דקות</span>
              </p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-blue-300/40 p-6 shadow-xl shadow-blue-500/10">
              <input
                type="number"
                inputMode="numeric"
                value={otpCode}
                maxLength={4}
                onChange={(e) => setOtpCode(e.target.value.slice(0, 4))}
                placeholder="––––"
                className="w-full h-20 text-center font-mono text-[48px] font-black tabular-nums tracking-[0.5em] text-slate-900 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition placeholder:text-slate-300"
              />
              <button className="w-full mt-3 text-[12px] text-blue-600 font-bold hover:underline">
                לא קיבלת? שלח קוד מחדש
              </button>
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={verifyOTP}
                  disabled={otpCode.length !== 4}
                  className="w-full h-14 rounded-2xl text-[15px] font-black inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                  style={{
                    background: otpCode.length === 4 ? "linear-gradient(180deg, #B5FF8C 0%, #50FF0A 50%, #2EA10D 100%)" : "#CBD5E1",
                    color: otpCode.length === 4 ? "#0F2A04" : "#64748B",
                    boxShadow: otpCode.length === 4 ? `inset 0 2px 0 0 rgba(255,255,255,0.5), 0 4px 16px -2px rgba(80,255,10,0.5)` : "none",
                  }}
                >
                  אמת ואישר חתימה
                  <Lock className="size-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 4: DONE */}
        {step === "done" && (
          <div className="text-center py-12 animate-in zoom-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center size-24 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 text-white mb-5 shadow-2xl shadow-green-500/50 animate-in zoom-in duration-700">
              <CheckCircle2 className="size-12" />
            </div>
            <h1 className="text-[32px] font-black text-slate-900 tracking-tight mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-green-600 to-emerald-700">חתמת בהצלחה!</span> 🎉
            </h1>
            <p className="text-[14px] text-slate-600 max-w-md mx-auto">
              ההסכם נחתם ונשמר במערכת.<br/>
              נציג בינגו ייצור איתך קשר בקרוב לסיום ההלוואה.
            </p>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 mt-6 max-w-md mx-auto text-right">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-2">פרטי חתימה</div>
              <div className="space-y-1.5 text-[12px]">
                <Row label="חותם" value={lead.name} />
                <Row label="ת.ז." value={lead.idNumber} />
                <Row label="סכום" value={`₪${lead.amount.toLocaleString()}`} />
                <Row label="מספר חוזה" value={`BG-2026-${leadId.padStart(5, "0")}`} />
                <Row label="תאריך" value={new Date().toLocaleString("he-IL")} />
                <Row label="אישור" value="✓ אומת בטלפון" />
              </div>
            </div>

            <button className="mt-6 h-12 px-6 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold hover:bg-slate-200">
              📄 הורד עותק PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-200" : ""}>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</div>
      <div className={`font-black tabular-nums ${highlight ? "text-[18px] text-emerald-700" : "text-[15px] text-slate-900"}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-900 tabular-nums">{value}</span>
    </div>
  );
}
