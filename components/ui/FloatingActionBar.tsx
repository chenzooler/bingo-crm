"use client";
import * as React from "react";
import { Phone, MessageCircle, Mail, FileText, Sparkles, Mic, Command } from "lucide-react";
import { Icon3D } from "./Icon3D";

interface Action {
  key: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  tone: "green" | "blue" | "purple" | "orange" | "cyan" | "pink";
  onClick?: () => void;
}

const ACTIONS: Action[] = [
  { key: "call",     label: "חיוג",        shortcut: "C", icon: Phone,         tone: "green"  },
  { key: "whatsapp", label: "WhatsApp",   shortcut: "W", icon: MessageCircle, tone: "green"  },
  { key: "sms",      label: "SMS",        shortcut: "S", icon: Mail,          tone: "blue"   },
  { key: "note",     label: "הערה",        shortcut: "N", icon: FileText,      tone: "purple" },
  { key: "voice",    label: "הקלטה",       shortcut: "R", icon: Mic,           tone: "pink"   },
  { key: "ai",       label: "AI עוזר",     shortcut: "J", icon: Sparkles,      tone: "purple" },
];

export function FloatingActionBar() {
  const [hover, setHover] = React.useState<string | null>(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-900/40">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const isHovered = hover === a.key;
          return (
            <button
              key={a.key}
              onMouseEnter={() => setHover(a.key)}
              onMouseLeave={() => setHover(null)}
              onClick={a.onClick}
              className="relative group transition-all duration-200 hover:-translate-y-1"
              title={a.label}
            >
              <Icon3D icon={<Icon className="size-4" />} tone={a.tone} size={42} />

              {/* Floating label */}
              <div className={`absolute -top-9 left-1/2 -translate-x-1/2 transition-all duration-200 pointer-events-none ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
                <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-white/10 shadow-lg text-[11px] font-semibold text-white whitespace-nowrap inline-flex items-center gap-1.5">
                  {a.label}
                  {a.shortcut && (
                    <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-white/80">{a.shortcut}</kbd>
                  )}
                </div>
                {/* Arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 bg-slate-800 border-r border-b border-white/10 rotate-45" />
              </div>
            </button>
          );
        })}

        <div className="w-px h-8 bg-white/15 mx-1" />

        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-[11px] font-semibold transition group">
          <Command className="size-3.5" />
          <span>פעולות נוספות</span>
          <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/15">⌘K</kbd>
        </button>
      </div>
    </div>
  );
}
