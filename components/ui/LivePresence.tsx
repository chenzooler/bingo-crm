"use client";
import * as React from "react";
import * as Tooltip from "@radix-ui/react-popover";
import { Eye, Edit3, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

type PresenceActivity = "viewing" | "editing" | "calling";

interface Presence {
  userId: string;
  name: string;
  emoji?: string;
  activity: PresenceActivity;
  since: string; // relative
}

// Mock presence — deterministic per lead-id seed
function mockPresence(seed: string): Presence[] {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const all: Presence[] = [
    { userId: "u1", name: "מאיה לוי", emoji: "🌟", activity: "viewing", since: "לפני 1 דק'" },
    { userId: "u2", name: "אורי כהן", emoji: "📞", activity: "calling", since: "כרגע" },
    { userId: "u3", name: "תמר רז", emoji: "💼", activity: "editing", since: "לפני 3 דק'" },
    { userId: "u4", name: "רותם בן-דוד", emoji: "🎯", activity: "viewing", since: "לפני 2 דק'" },
  ];
  // Pick 0-3 based on hash
  const count = hash % 4;
  return all.slice(0, count);
}

const ACTIVITY_META: Record<PresenceActivity, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  viewing: { icon: Eye, color: "bg-status-blue text-white", label: "צופה" },
  editing: { icon: Edit3, color: "bg-status-orange text-white", label: "עורך" },
  calling: { icon: Phone, color: "bg-bingo-green text-bingo-black", label: "בשיחה" },
};

export function LivePresence({ leadId, size = "sm" }: { leadId: string; size?: "sm" | "md" }) {
  const [presence, setPresence] = React.useState<Presence[]>([]);

  React.useEffect(() => {
    // Simulate fetch + occasional updates
    setPresence(mockPresence(leadId));
    const interval = setInterval(() => {
      setPresence(mockPresence(leadId + Math.floor(Date.now() / 30000)));
    }, 30000);
    return () => clearInterval(interval);
  }, [leadId]);

  if (presence.length === 0) return null;

  const avatarSize = size === "md" ? 28 : 22;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-bingo-green/12 border border-bingo-green/30 hover:bg-bingo-green/20 transition">
          <div className="flex -space-x-1.5 -space-x-reverse">
            {presence.slice(0, 3).map((p) => (
              <div
                key={p.userId}
                className={cn(
                  "rounded-full ring-2 ring-white relative",
                  size === "md" ? "size-7" : "size-5"
                )}
                style={{ width: avatarSize, height: avatarSize }}
              >
                <Avatar name={p.name} emoji={p.emoji} size={size === "md" ? "sm" : "sm"} />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-1 ring-white animate-pulse",
                    ACTIVITY_META[p.activity].color
                  )}
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-bingo-green-dark whitespace-nowrap">
            {presence.length} {presence.length === 1 ? "צופה" : "צופים"} עכשיו
          </span>
          <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          align="end"
          sideOffset={8}
          className="surface-card-elevated p-2 w-64 z-50 animate-fade-in"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 px-2 py-1">
            פעילות חיה בליד
          </div>
          <div className="space-y-0.5">
            {presence.map((p) => {
              const meta = ACTIVITY_META[p.activity];
              const Icon = meta.icon;
              return (
                <div key={p.userId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bingo-gray-50">
                  <Avatar name={p.name} emoji={p.emoji} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-bingo-black truncate">{p.name}</div>
                    <div className="text-[10px] text-bingo-gray-500">{p.since}</div>
                  </div>
                  <span className={cn("text-[9px] font-bold rounded-md px-1.5 py-0.5 inline-flex items-center gap-1", meta.color)}>
                    <Icon className="size-2.5" />
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
