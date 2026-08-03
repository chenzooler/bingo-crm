"use client";
import * as React from "react";

/**
 * הגשר בין הנגן לתמלול ולתובנות ה-AI.
 * הנגן רושם את אלמנט ה-audio; כל לחיצה על חותמת זמן, ראיה או רגע מפתח
 * קוראת ל-seekTo ומקפיצה את ההקלטה. גם כשאין הקלטה - הזמן הנוכחי מתעדכן
 * כדי שהסגמנט המתאים בתמלול יסומן.
 */
interface CallReviewValue {
  currentTime: number;
  playing: boolean;
  seekTo: (seconds: number) => void;
  registerAudio: (el: HTMLAudioElement | null) => void;
  setCurrentTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  hasAudio: boolean;
}

const FALLBACK: CallReviewValue = {
  currentTime: 0,
  playing: false,
  seekTo: () => {},
  registerAudio: () => {},
  setCurrentTime: () => {},
  setPlaying: () => {},
  hasAudio: false,
};

const Ctx = React.createContext<CallReviewValue | null>(null);

export function CallReviewProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [hasAudio, setHasAudio] = React.useState(false);

  const registerAudio = React.useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    setHasAudio(Boolean(el));
  }, []);

  const seekTo = React.useCallback((seconds: number) => {
    const target = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    setCurrentTime(target);
    const a = audioRef.current;
    if (!a) return;
    try {
      a.currentTime = target;
      void a.play().catch(() => {});
    } catch {
      /* דפדפן שחוסם ניגון אוטומטי - הסימון בתמלול עדיין קופץ */
    }
  }, []);

  const value = React.useMemo<CallReviewValue>(
    () => ({ currentTime, playing, seekTo, registerAudio, setCurrentTime, setPlaying, hasAudio }),
    [currentTime, playing, seekTo, registerAudio, hasAudio],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCallReview(): CallReviewValue {
  return React.useContext(Ctx) ?? FALLBACK;
}
