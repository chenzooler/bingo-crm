"use client";
import * as React from "react";
import { Play, Pause, RotateCcw, RotateCw, Download, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallReview } from "./CallReviewContext";
import { formatDuration } from "./quality-utils";

const SPEEDS = [1, 1.25, 1.5, 2] as const;

/**
 * נגן ההקלטה - HTML5 audio עם שלט פרימיום.
 * מזין את ה-context בזמן הנוכחי (לסימון הסגמנט בתמלול) ומקבל ממנו קפיצות.
 */
export function CallAudioPlayer({ src, fallbackDuration }: { src: string | null; fallbackDuration?: number | null }) {
  const { registerAudio, setCurrentTime, currentTime, setPlaying, playing } = useCallReview();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = React.useState<number>(fallbackDuration ?? 0);
  const [speed, setSpeed] = React.useState<number>(1);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    registerAudio(src ? audioRef.current : null);
    return () => registerAudio(null);
  }, [registerAudio, src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setError(true));
    else a.pause();
  };

  const nudge = (delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.min(Math.max(0, a.currentTime + delta), duration || a.duration || 0);
    setCurrentTime(a.currentTime);
  };

  const applySpeed = (s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  if (!src) {
    return (
      <div className="b-card !p-4 flex items-center gap-3">
        <span className="b-icon b-icon-gray !size-10 shrink-0">
          <AudioLines className="size-4" />
        </span>
        <div>
          <div className="text-[13px] font-bold text-bingo-black">אין הקלטה לשיחה הזו</div>
          <div className="text-[11px] text-bingo-gray-500 mt-0.5">
            {fallbackDuration ? "ההקלטה עוד לא הגיעה מהמרכזייה" : "השיחה לא נענתה, ולכן אין מה להשמיע"}
          </div>
        </div>
      </div>
    );
  }

  const max = duration || fallbackDuration || 0;
  const pct = max > 0 ? Math.min(100, (currentTime / max) * 100) : 0;

  return (
    <div className="b-obsidian rounded-[20px] p-4 text-white">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
          e.currentTarget.playbackRate = speed;
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="b-lift size-12 rounded-2xl bg-bingo-green text-bingo-black inline-flex items-center justify-center shrink-0"
          aria-label={playing ? "השהה" : "נגן"}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>

        <button type="button" onClick={() => nudge(-10)} className="size-9 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition" aria-label="אחורה 10 שניות">
          <RotateCcw className="size-4" />
        </button>
        <button type="button" onClick={() => nudge(10)} className="size-9 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition" aria-label="קדימה 10 שניות">
          <RotateCw className="size-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-bingo-green rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={max || 1}
              step={0.1}
              value={Math.min(currentTime, max || 1)}
              onChange={onScrub}
              className="relative w-full h-6 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
              aria-label="מיקום בהקלטה"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums opacity-70">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(max)}</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 bg-white/10 rounded-xl p-0.5 shrink-0">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySpeed(s)}
              className={cn(
                "h-7 px-2 rounded-lg text-[11px] font-bold tabular-nums transition",
                speed === s ? "bg-white text-bingo-black" : "text-white/70 hover:text-white",
              )}
            >
              {s}x
            </button>
          ))}
        </div>

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="size-9 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition shrink-0"
          aria-label="פתח את ההקלטה"
          title="פתח את ההקלטה"
        >
          <Download className="size-4" />
        </a>
      </div>

      {error && (
        <div className="mt-2.5 text-[11px] text-white/70">
          לא הצלחנו לטעון את ההקלטה. אפשר לפתוח אותה ישירות בכפתור ההורדה.
        </div>
      )}
    </div>
  );
}
