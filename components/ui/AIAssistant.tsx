"use client";
import * as React from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Sparkles, Send, X, ArrowLeft, Loader2, Wand2, Command,
  Mic, Paperclip, ChevronLeft, RotateCw,
} from "lucide-react";
import { type ChatMessage, QUICK_ACTIONS, generateAIResponse } from "@/lib/data/ai-assistant";
import { cn } from "@/lib/utils";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "שלום חן 👋 אני BINGO AI — העוזר האישי שלך. אני יודע הכל על המערכת, הלידים שלך והביצועים. במה אוכל לעזור?",
  timestamp: Date.now(),
  suggestions: ["מי הלידים החמים שלי?", "סכם את החודש", "תכין תסריט שיחה"],
};

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  // ⌘+J shortcut
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Auto-scroll
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  async function send(text: string) {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate streaming delay
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));

    const response = generateAIResponse(text);
    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      timestamp: Date.now(),
      ...response,
    };
    setMessages((m) => [...m, aiMsg]);
    setThinking(false);
  }

  function reset() {
    setMessages([WELCOME]);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-12 md:inset-y-0 md:left-0 md:top-0 md:right-auto z-50 w-full md:max-w-xl bg-bingo-cream border-t md:border-t-0 md:border-l border-bingo-gray-200 rounded-t-3xl md:rounded-none flex flex-col bingo-shadow-lg animate-slide-in-up md:animate-slide-in-left pb-safe">
          {/* Header */}
          <div className="px-5 py-3 bg-gradient-to-br from-bingo-green/20 via-bingo-green/8 to-transparent border-b border-bingo-gray-150 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dialog.Close className="size-9 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
                <ChevronLeft className="size-4 rotate-180" />
              </Dialog.Close>
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-bingo-black text-bingo-green inline-flex items-center justify-center bingo-shadow-sm relative">
                  <Sparkles className="size-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-bingo-green rounded-full ring-2 ring-bingo-black animate-pulse" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-black text-bingo-black leading-none">
                    BINGO AI
                  </Dialog.Title>
                  <p className="text-[10px] text-bingo-gray-500 mt-0.5">העוזר האישי שלך · מקוון</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="size-8 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center text-bingo-gray-500"
                title="התחל שיחה חדשה"
              >
                <RotateCw className="size-4" />
              </button>
              <kbd className="font-mono text-[10px] bg-white border border-bingo-gray-200 rounded px-1.5 py-0.5 text-bingo-gray-600">
                ⌘J
              </kbd>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg) => (
              <MessageRow key={msg.id} message={msg} onSuggest={send} />
            ))}
            {thinking && <ThinkingIndicator />}
            <div ref={endRef} />
          </div>

          {/* Quick actions (when empty) */}
          {messages.length === 1 && !thinking && (
            <div className="px-5 pb-3 border-t border-bingo-gray-150 pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">
                התחל מהיר
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.prompt)}
                    className="text-right px-3 py-2 rounded-xl bg-white border border-bingo-gray-200 hover:border-bingo-green hover:bingo-shadow-sm transition text-[12px] flex items-center gap-2"
                  >
                    <span className="text-base">{q.emoji}</span>
                    <span className="font-bold text-bingo-charcoal truncate">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-5 py-3 border-t border-bingo-gray-150 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim() && !thinking) send(input.trim());
              }}
              className="flex items-end gap-2"
            >
              <button
                type="button"
                className="size-9 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center text-bingo-gray-500 shrink-0"
                title="הוסף קובץ"
              >
                <Paperclip className="size-4" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !thinking) send(input.trim());
                    }
                  }}
                  placeholder="שאל את BINGO AI כל דבר..."
                  rows={1}
                  className="w-full max-h-32 resize-none px-3 py-2 rounded-xl border border-bingo-gray-200 focus:border-bingo-green focus:ring-2 focus:ring-bingo-green/30 outline-none text-[13px] text-bingo-black placeholder:text-bingo-gray-400"
                />
              </div>
              <button
                type="button"
                className="size-9 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center text-bingo-gray-500 shrink-0"
                title="קלט קולי"
              >
                <Mic className="size-4" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="size-9 rounded-xl bg-bingo-black text-bingo-green hover:bg-bingo-charcoal disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center transition bingo-shadow-sm shrink-0"
                title="שלח"
              >
                {thinking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rotate-180" />}
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 text-[10px] text-bingo-gray-400">
              <span className="flex items-center gap-1">
                <Wand2 className="size-2.5" />
                מופעל על ידי BINGO Brain · גרסה ניסיונית
              </span>
              <span>{messages.length - 1} הודעות</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MessageRow({ message, onSuggest }: { message: ChatMessage; onSuggest: (s: string) => void }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] bg-bingo-black text-white px-4 py-2.5 rounded-2xl rounded-br-sm">
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2.5 items-start">
      <div className="flex-1 max-w-[88%] space-y-2">
        <div className="bg-white border border-bingo-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm">
          <div className="text-[13px] text-bingo-charcoal leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {/* Data table */}
        {message.data && message.data.length > 0 && (
          <div className="bg-white border border-bingo-gray-200 rounded-2xl overflow-hidden">
            {message.data.map((row, i) => {
              const inner = (
                <div className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-bingo-gray-50 transition">
                  <div className="text-[12px] font-bold text-bingo-black truncate">{row.label}</div>
                  <div className="text-[11px] text-bingo-gray-600 text-left truncate">{row.value}</div>
                </div>
              );
              return (
                <div key={i} className={cn(i > 0 && "border-t border-bingo-gray-100")}>
                  {row.href ? <Link href={row.href}>{inner}</Link> : inner}
                </div>
              );
            })}
          </div>
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggest(s)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-bingo-gray-200 hover:border-bingo-green hover:text-bingo-green-dark transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="size-8 rounded-xl bg-bingo-black text-bingo-green inline-flex items-center justify-center shrink-0 bingo-shadow-sm">
        <Sparkles className="size-4" />
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-end gap-2.5 items-start">
      <div className="bg-white border border-bingo-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-bingo-green animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="size-1.5 rounded-full bg-bingo-green animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="size-1.5 rounded-full bg-bingo-green animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      <div className="size-8 rounded-xl bg-bingo-black text-bingo-green inline-flex items-center justify-center shrink-0 bingo-shadow-sm">
        <Sparkles className="size-4" />
      </div>
    </div>
  );
}

/** Floating launch button — bottom-right */
export function AIAssistantLauncher() {
  return (
    <button
      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "j", metaKey: true, bubbles: true }))}
      className="fixed bottom-20 md:bottom-24 left-6 z-30 h-12 px-4 rounded-2xl bg-bingo-black text-bingo-green hover:bg-bingo-charcoal inline-flex items-center gap-2 bingo-shadow-lg transition group"
      title="פתח BINGO AI (⌘J)"
    >
      <Sparkles className="size-4 group-hover:scale-110 transition" />
      <span className="text-[12px] font-bold">שאל AI</span>
      <kbd className="font-mono text-[9px] bg-bingo-green/20 text-bingo-green rounded px-1 py-0.5">⌘J</kbd>
    </button>
  );
}
