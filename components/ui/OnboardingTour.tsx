"use client";
import * as React from "react";
import { Sparkles, X, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const STEPS: TourStep[] = [
  {
    title: "ברוכים הבאים ל-BINGO CRM 🎉",
    description: "המערכת המתקדמת ביותר לניהול לידים, שיחות ואשראי במקום אחד. בוא נראה לך את העיקר ב-60 שניות.",
    icon: <PartyPopper className="size-6" />,
  },
  {
    title: "מחזור חיים מאוחד",
    description: "כל ליד עובר 10 שלבים ברורים: ליד חדש → קשר → סינון → חוזה → BDI → מכרז → החלטה → מסמכים → תשלום → שולם. ראה הכל בלוח Kanban.",
    icon: <span className="text-2xl">🎯</span>,
  },
  {
    title: "Power Dialer",
    description: "חייגן חכם שמתקשר אוטומטית, מסנן ספאם ומחלק מספרים בריאים בין הנציגים. עם AI Co-pilot בזמן השיחה.",
    icon: <span className="text-2xl">📞</span>,
  },
  {
    title: "תצוגות שמורות",
    description: "צור פילטרים אישיים: 'חמים שלי', 'גדולים', 'תקועים'. שמור והצמד למעלה לגישה מהירה.",
    icon: <span className="text-2xl">⭐</span>,
  },
  {
    title: "פעולות מרובות",
    description: "סמן לידים בטבלה והפעל פעולה על כולם בבת אחת: הקצאה, תיוג, WhatsApp, יצוא ועוד.",
    icon: <span className="text-2xl">✅</span>,
  },
  {
    title: "קיצורי מקלדת",
    description: "לחץ ? בכל מקום לפתיחת רשימת הקיצורים. ⌘+K לחיפוש מהיר, C לליד חדש, T למשימה.",
    icon: <span className="text-2xl">⌨️</span>,
  },
  {
    title: "אתה מוכן! 🚀",
    description: "התחל ליצור קסם. הצוות שלנו תמיד זמין דרך הצ'אט בפינה הימנית למטה.",
    icon: <Sparkles className="size-6" />,
  },
];

const STORAGE_KEY = "bingo-onboarding-complete";

export function OnboardingTour() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay to avoid hydration flash
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }

  function next() {
    if (step >= STEPS.length - 1) close();
    else setStep((s) => s + 1);
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bingo-onyx/50 backdrop-blur-md" onClick={close} />

      {/* Modal */}
      <div className="relative w-full max-w-lg surface-card-elevated overflow-hidden bingo-shadow-lg">
        {/* Header gradient */}
        <div className="bg-gradient-to-bl from-bingo-green/15 via-bingo-green/5 to-transparent px-7 pt-7 pb-5 relative">
          <button
            onClick={close}
            className="absolute top-3 left-3 size-8 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center text-bingo-gray-500"
            title="דלג על הסיור"
          >
            <X className="size-4" />
          </button>

          <div className="size-14 rounded-2xl bg-bingo-green text-bingo-black inline-flex items-center justify-center bingo-shadow mb-4">
            {current.icon}
          </div>

          <h2 className="text-2xl font-black text-bingo-black tracking-tight leading-tight mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-bingo-charcoal leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="px-7 py-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-8 bg-bingo-green" : i < step ? "w-1.5 bg-bingo-green/60" : "w-1.5 bg-bingo-gray-200"
              )}
              aria-label={`עבור לשלב ${i + 1}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-bingo-gray-150 bg-bingo-gray-50 flex items-center justify-between">
          <button
            onClick={close}
            className="text-[12px] font-bold text-bingo-gray-500 hover:text-bingo-black transition"
          >
            דלג על הסיור
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="h-9 px-3 rounded-lg border border-bingo-gray-200 bg-white text-[12px] font-bold inline-flex items-center gap-1 hover:bg-bingo-gray-100 transition"
              >
                <ChevronRight className="size-3.5" />
                הקודם
              </button>
            )}
            <button
              onClick={next}
              className="h-9 px-4 rounded-lg bg-bingo-black text-white text-[12px] font-bold inline-flex items-center gap-1 hover:bg-bingo-charcoal transition bingo-shadow"
            >
              {isLast ? "בוא נתחיל!" : "הבא"}
              {!isLast && <ChevronLeft className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Manually trigger the tour from settings or help menu */
export function resetOnboarding() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  } catch {}
}
