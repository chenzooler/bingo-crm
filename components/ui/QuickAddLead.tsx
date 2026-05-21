"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X, UserPlus, Phone, Mail, Hash, Banknote, Tag, Users,
  Sparkles, ChevronLeft, Loader2, CheckCircle2,
} from "lucide-react";
import { CATEGORIES, COMMON_TAGS, type LeadCategory } from "@/lib/data/lifecycle";
import { USERS } from "@/lib/data/static";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { cn, isValidIsraeliPhone, isValidIsraeliId } from "@/lib/utils";

type Step = "basics" | "categorize" | "assign" | "done";

interface FormData {
  fullName: string;
  phone: string;
  idNumber: string;
  email: string;
  amountRequested: string;
  category: LeadCategory | "";
  tags: string[];
  ownerId: number | null;
  notes: string;
}

const INITIAL: FormData = {
  fullName: "",
  phone: "",
  idNumber: "",
  email: "",
  amountRequested: "",
  category: "",
  tags: [],
  ownerId: null,
  notes: "",
};

export function QuickAddLead() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("basics");
  const [data, setData] = React.useState<FormData>(INITIAL);
  const [saving, setSaving] = React.useState(false);
  const { push } = useToast();

  // Global C shortcut
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isTyping) return;
      if (e.key === "c" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
        setStep("basics");
        setData(INITIAL);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const phoneValid = !data.phone || isValidIsraeliPhone(data.phone);
  const idValid = !data.idNumber || isValidIsraeliId(data.idNumber);
  const canProceed = data.fullName.trim().length >= 2 && phoneValid && idValid;

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setData((d) => ({ ...d, [key]: val }));
  }

  async function submit() {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setStep("done");
    push({
      type: "success",
      title: "🎉 הליד נוצר בהצלחה",
      description: `${data.fullName} נוסף למערכת — AI Co-pilot מתחיל ניתוח`,
    });
    // Auto-close after 1.5s
    setTimeout(() => {
      setOpen(false);
      setStep("basics");
      setData(INITIAL);
    }, 1800);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 surface-card-elevated overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-5 py-3 bg-gradient-to-bl from-bingo-green/15 to-transparent border-b border-bingo-gray-150 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-bingo-green text-bingo-black inline-flex items-center justify-center bingo-shadow-sm">
                <UserPlus className="size-4" />
              </div>
              <div>
                <Dialog.Title className="text-base font-extrabold text-bingo-black">
                  ליד חדש מהיר
                </Dialog.Title>
                <Dialog.Description className="text-[10px] text-bingo-gray-500">
                  הוסף ליד בכמה שניות — AI יסיים את השאר
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="size-8 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {/* Steps progress */}
          <div className="px-5 py-2 border-b border-bingo-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-bingo-gray-500">
            <StepBadge label="פרטים" active={step === "basics"} done={step === "categorize" || step === "assign" || step === "done"} />
            <span className="text-bingo-gray-300">→</span>
            <StepBadge label="קטגוריה" active={step === "categorize"} done={step === "assign" || step === "done"} />
            <span className="text-bingo-gray-300">→</span>
            <StepBadge label="הקצאה" active={step === "assign"} done={step === "done"} />
          </div>

          {/* Body */}
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {step === "basics" && <BasicsStep data={data} set={set} phoneValid={phoneValid} idValid={idValid} />}
            {step === "categorize" && <CategorizeStep data={data} set={set} />}
            {step === "assign" && <AssignStep data={data} set={set} />}
            {step === "done" && <DoneStep data={data} />}
          </div>

          {/* Footer */}
          {step !== "done" && (
            <div className="px-5 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50 flex items-center justify-between">
              <kbd className="font-mono text-[10px] bg-white border border-bingo-gray-200 rounded px-1.5 py-0.5 text-bingo-gray-600">
                Esc לסגור
              </kbd>
              <div className="flex items-center gap-2">
                {step !== "basics" && (
                  <button
                    onClick={() => setStep(step === "categorize" ? "basics" : "categorize")}
                    className="h-9 px-3 rounded-lg border border-bingo-gray-200 bg-white text-[12px] font-bold inline-flex items-center gap-1 hover:bg-bingo-gray-100 transition"
                  >
                    <ChevronLeft className="size-3.5 rotate-180" />
                    הקודם
                  </button>
                )}
                {step === "basics" && (
                  <button
                    onClick={() => setStep("categorize")}
                    disabled={!canProceed}
                    className="h-9 px-4 rounded-lg bg-bingo-black text-white text-[12px] font-bold inline-flex items-center gap-1 hover:bg-bingo-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    הבא
                    <ChevronLeft className="size-3.5" />
                  </button>
                )}
                {step === "categorize" && (
                  <button
                    onClick={() => setStep("assign")}
                    className="h-9 px-4 rounded-lg bg-bingo-black text-white text-[12px] font-bold inline-flex items-center gap-1 hover:bg-bingo-charcoal transition"
                  >
                    הבא
                    <ChevronLeft className="size-3.5" />
                  </button>
                )}
                {step === "assign" && (
                  <button
                    onClick={submit}
                    disabled={saving}
                    className="h-9 px-4 rounded-lg bg-bingo-green text-bingo-black text-[12px] font-bold inline-flex items-center gap-1.5 hover:bg-bingo-green/80 transition bingo-shadow-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        צור ליד
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StepBadge({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md uppercase tracking-wider",
      active && "bg-bingo-green text-bingo-black",
      done && !active && "text-bingo-green-dark",
      !active && !done && "text-bingo-gray-400"
    )}>
      {label}
    </span>
  );
}

function BasicsStep({ data, set, phoneValid, idValid }: {
  data: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  phoneValid: boolean;
  idValid: boolean;
}) {
  return (
    <div className="space-y-3">
      <FieldRow icon={<UserPlus className="size-4" />} label="שם מלא *">
        <input
          autoFocus
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="יוסי כהן"
          className="input-fintech w-full"
        />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow icon={<Phone className="size-4" />} label="טלפון" error={!phoneValid ? "מספר לא תקין" : undefined}>
          <input
            value={data.phone}
            onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
            placeholder="0501234567"
            dir="ltr"
            className={cn("input-fintech w-full font-mono", !phoneValid && "border-status-red")}
          />
        </FieldRow>
        <FieldRow icon={<Hash className="size-4" />} label="ת.ז." error={!idValid ? "ת.ז. לא תקינה" : undefined}>
          <input
            value={data.idNumber}
            onChange={(e) => set("idNumber", e.target.value.replace(/[^\d]/g, ""))}
            placeholder="123456789"
            dir="ltr"
            className={cn("input-fintech w-full font-mono", !idValid && "border-status-red")}
          />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow icon={<Mail className="size-4" />} label="אימייל">
          <input
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@example.com"
            dir="ltr"
            className="input-fintech w-full"
          />
        </FieldRow>
        <FieldRow icon={<Banknote className="size-4" />} label="סכום מבוקש">
          <div className="relative">
            <input
              type="text"
              value={data.amountRequested ? Number(data.amountRequested).toLocaleString("he-IL") : ""}
              onChange={(e) => set("amountRequested", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="100,000"
              className="input-fintech w-full font-mono pl-7"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bingo-gray-400 text-xs">₪</span>
          </div>
        </FieldRow>
      </div>
    </div>
  );
}

function CategorizeStep({ data, set }: {
  data: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">קטגוריה</div>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => set("category", c.key)}
              className={cn(
                "px-3 py-2.5 rounded-xl border-2 text-right transition text-[13px] font-bold flex items-center gap-2",
                data.category === c.key
                  ? "border-bingo-green bg-bingo-green/12 text-bingo-black"
                  : "border-bingo-gray-200 bg-white hover:border-bingo-gray-300 text-bingo-charcoal"
              )}
            >
              <span className="text-base">{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2 inline-flex items-center gap-1.5">
          <Tag className="size-3" /> תגיות (אופציונלי)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.map((t) => {
            const active = data.tags.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => set("tags", active ? data.tags.filter((x) => x !== t.key) : [...data.tags, t.key])}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-bold transition border",
                  active
                    ? "bg-bingo-black text-white border-bingo-black"
                    : "bg-white text-bingo-charcoal border-bingo-gray-200 hover:border-bingo-gray-400"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AssignStep({ data, set }: {
  data: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2 inline-flex items-center gap-1.5">
          <Users className="size-3" /> הקצה לנציג
        </div>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          <button
            onClick={() => set("ownerId", null)}
            className={cn(
              "px-2 py-2 rounded-xl border-2 text-center transition",
              data.ownerId === null
                ? "border-bingo-green bg-bingo-green/12"
                : "border-bingo-gray-200 hover:border-bingo-gray-300"
            )}
          >
            <Sparkles className="size-5 mx-auto mb-1 text-bingo-green-dark" />
            <div className="text-[10px] font-bold text-bingo-charcoal leading-tight">AI יחליט</div>
          </button>
          {USERS.slice(0, 11).map((u) => (
            <button
              key={u.id}
              onClick={() => set("ownerId", u.id)}
              className={cn(
                "px-2 py-2 rounded-xl border-2 text-center transition",
                data.ownerId === u.id
                  ? "border-bingo-green bg-bingo-green/12"
                  : "border-bingo-gray-200 hover:border-bingo-gray-300"
              )}
            >
              <div className="mx-auto mb-1 w-fit">
                <Avatar name={u.name} emoji={u.emoji} size="sm" />
              </div>
              <div className="text-[10px] font-bold text-bingo-charcoal truncate leading-tight">{u.name.split(" ")[0]}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1.5">הערות פתיחה</div>
        <textarea
          value={data.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="פרטים נוספים על השיחה הראשונה..."
          rows={3}
          className="input-fintech w-full resize-none"
        />
      </div>
    </div>
  );
}

function DoneStep({ data }: { data: FormData }) {
  return (
    <div className="text-center py-6">
      <div className="size-16 rounded-3xl bg-bingo-green text-bingo-black inline-flex items-center justify-center mb-3 bingo-shadow animate-pulse-green">
        <CheckCircle2 className="size-8" />
      </div>
      <h3 className="text-xl font-black text-bingo-black">הליד נוצר! 🎉</h3>
      <p className="text-[13px] text-bingo-gray-600 mt-1.5">
        {data.fullName} נוסף למערכת ו-AI Co-pilot כבר מנתח את הפרופיל
      </p>
    </div>
  );
}

function FieldRow({ icon, label, error, children }: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
      {error && <div className="text-[10px] text-status-red font-bold mt-1">{error}</div>}
    </div>
  );
}
