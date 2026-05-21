"use client";
import * as React from "react";
import Link from "next/link";
import { Zap, Trophy, ArrowLeft, Lock } from "lucide-react";
import {
  PLAYER, BADGES, RARITY_META,
  getCurrentLevel, getNextLevel, getLevelProgress,
} from "@/lib/data/gamification";
import { cn } from "@/lib/utils";

export function GamificationWidget() {
  const current = getCurrentLevel(PLAYER.xp);
  const next = getNextLevel(PLAYER.xp);
  const prog = getLevelProgress(PLAYER.xp);
  const unlockedBadges = BADGES.filter((b) => b.unlocked);
  const inProgressBadges = BADGES.filter((b) => !b.unlocked && b.progress);

  return (
    <div className="surface-card-elevated overflow-hidden">
      {/* Header — level card */}
      <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-bingo-black via-[#1a1a1a] to-[#2a2a2a] text-white overflow-hidden">
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-bingo-green/20 blur-3xl pointer-events-none" />
        <div className="relative flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-green opacity-80">רמה {current.level}</div>
            <div className="text-2xl font-black flex items-center gap-2 leading-tight">
              <span>{current.emoji}</span>
              <span>{current.title}</span>
            </div>
            <div className="text-[11px] text-white/60 mt-0.5 font-mono tabular-nums">
              {PLAYER.xp.toLocaleString("he-IL")} XP
            </div>
          </div>
          <div className="size-12 rounded-2xl bg-bingo-green/20 border border-bingo-green/40 inline-flex items-center justify-center backdrop-blur">
            <Trophy className="size-5 text-bingo-green" />
          </div>
        </div>

        {/* Progress to next level */}
        {next && (
          <div className="relative">
            <div className="flex items-center justify-between text-[10px] mb-1.5 text-white/80">
              <span className="font-bold">לרמה הבאה: {next.emoji} {next.title}</span>
              <span className="font-mono tabular-nums">{prog.into}/{prog.span} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-bingo-green via-emerald-400 to-bingo-green rounded-full transition-all"
                style={{ width: `${prog.pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Today XP feed */}
      <div className="px-5 py-3 border-b border-bingo-gray-150">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-bingo-charcoal flex items-center gap-1.5">
            <Zap className="size-3 text-bingo-green-dark" />
            XP היום
          </h4>
          <div className="text-[14px] font-black text-bingo-green-dark tabular-nums">
            +{PLAYER.todayActivity.reduce((a, b) => a + b.xp, 0)} XP
          </div>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {PLAYER.todayActivity.slice().reverse().slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-bingo-gray-400 tabular-nums">{a.time}</span>
                <span className="text-bingo-charcoal truncate">{a.action}</span>
              </div>
              <span className="font-bold font-mono tabular-nums text-bingo-green-dark">+{a.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-bingo-charcoal">
            תגי הישג ({unlockedBadges.length}/{BADGES.length})
          </h4>
          <Link href="/profile?tab=achievements" className="text-[10px] font-bold text-bingo-green-dark hover:underline inline-flex items-center gap-0.5">
            הכל <ArrowLeft className="size-2.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {unlockedBadges.slice(0, 4).map((b) => (
            <BadgeChip key={b.id} badge={b} />
          ))}
          {inProgressBadges.slice(0, 4 - unlockedBadges.slice(0, 4).length).map((b) => (
            <BadgeChip key={b.id} badge={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BadgeChip({ badge }: { badge: (typeof BADGES)[number] }) {
  const meta = RARITY_META[badge.rarity];
  const progress = badge.progress ? (badge.progress.current / badge.progress.target) * 100 : 100;

  return (
    <div
      className={cn(
        "aspect-square rounded-xl border-2 relative flex flex-col items-center justify-center gap-0.5 transition group",
        badge.unlocked ? meta.bg : "bg-bingo-gray-50 border-bingo-gray-150 opacity-60 hover:opacity-100",
      )}
      title={`${badge.name} — ${badge.description}`}
    >
      <span className="text-xl">{badge.unlocked ? badge.emoji : "🔒"}</span>
      <span className={cn("text-[8px] font-bold text-center leading-tight px-1", meta.color)}>
        {badge.name}
      </span>
      {!badge.unlocked && badge.progress && (
        <div className="absolute inset-x-1 bottom-0.5 h-0.5 bg-bingo-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-bingo-green rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {badge.unlocked && badge.rarity === "legendary" && (
        <span className="absolute -top-1 -left-1 text-[8px]">✨</span>
      )}
    </div>
  );
}
