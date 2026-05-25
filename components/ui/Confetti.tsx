"use client";
import * as React from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  emoji: string;
  size: number;
}

const EMOJIS = ["🎉", "✨", "🎊", "💫", "⭐", "🌟", "💥", "🔥"];

/**
 * Burst of celebratory emoji that falls from origin point.
 * Use `key` to retrigger animation.
 */
export function Confetti({ trigger, count = 30 }: { trigger: number; count?: number }) {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);

  React.useEffect(() => {
    if (trigger === 0) return;
    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400,
      delay: Math.random() * 200,
      duration: 1500 + Math.random() * 1500,
      rotation: (Math.random() - 0.5) * 720,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 18 + Math.random() * 24,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(timer);
  }, [trigger, count]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute top-1/2 left-1/2">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute confetti-piece"
            style={{
              left: 0,
              top: 0,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}ms`,
              animationDelay: `${p.delay}ms`,
              ["--x" as any]: `${p.x}px`,
              ["--rotation" as any]: `${p.rotation}deg`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
