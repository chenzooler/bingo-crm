"use client";
import * as React from "react";
import { Radio } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface AgentActivity {
  id: string;
  agentName: string;
  emoji?: string;
  action: string;
  highlight?: string;
  time: string;
  tone: "green" | "amber" | "blue" | "purple" | "rose";
}

const MOCK_FEED: AgentActivity[] = [
  { id: "1", agentName: "אריאל פרגן", emoji: "💼", action: "סגר עסקה של",       highlight: "85,000₪",  time: "עכשיו",   tone: "green"  },
  { id: "2", agentName: "ניסן מליחי",  emoji: "🔥", action: "פתח מכרז ל-",        highlight: "12 גופים",  time: "1ד׳",     tone: "amber"  },
  { id: "3", agentName: "משה יונה",   emoji: "⚡", action: "ענה לליד חם",                                  time: "2ד׳",     tone: "rose"   },
  { id: "4", agentName: "יוסי כהן",    emoji: "🎯", action: "השלים שאלון של",     highlight: "מוחמד עוזד", time: "3ד׳",     tone: "blue"   },
  { id: "5", agentName: "שירה לוי",    emoji: "💎", action: "חוזה נחתם!",                                  time: "5ד׳",     tone: "purple" },
  { id: "6", agentName: "דנה ברק",     emoji: "🚀", action: "הצעה אושרה ב-",       highlight: "120,000₪", time: "8ד׳",     tone: "green"  },
];

export function LiveAgentTicker() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MOCK_FEED.length), 3500);
    return () => clearInterval(t);
  }, []);

  const item = MOCK_FEED[idx];
  const tones: Record<string, string> = {
    green:  "from-emerald-50 to-green-50 border-emerald-200",
    amber:  "from-amber-50 to-yellow-50 border-amber-200",
    blue:   "from-blue-50 to-cyan-50 border-blue-200",
    purple: "from-purple-50 to-indigo-50 border-purple-200",
    rose:   "from-rose-50 to-pink-50 border-rose-200",
  };
  const highlightTones: Record<string, string> = {
    green:  "text-emerald-700",
    amber:  "text-amber-700",
    blue:   "text-blue-700",
    purple: "text-purple-700",
    rose:   "text-rose-700",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${tones[item.tone]} p-3 transition-all duration-500`}>
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <div className="size-2 rounded-full bg-red-500 dot-pulse absolute top-0 left-0 z-10" />
          <Radio className="size-4 text-slate-500" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 animate-in slide-in-from-right-2 fade-in" key={item.id}>
          <Avatar name={item.agentName} emoji={item.emoji} size={24} />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-700 truncate">
              <span className="font-bold text-slate-900">{item.agentName}</span>
              <span className="mx-1">{item.action}</span>
              {item.highlight && (
                <span className={`font-black ${highlightTones[item.tone]}`}>{item.highlight}</span>
              )}
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">{item.time}</span>
        </div>
      </div>
    </div>
  );
}
