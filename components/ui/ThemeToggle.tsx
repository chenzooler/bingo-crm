"use client";
import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-0.5 bg-bingo-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => setTheme("light")}
        title="בהיר"
        className={cn("size-7 rounded-md inline-flex items-center justify-center transition", theme === "light" ? "bg-white text-bingo-black bingo-shadow-sm" : "text-bingo-gray-500 hover:text-bingo-black")}
      >
        <Sun className="size-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        title="כהה"
        className={cn("size-7 rounded-md inline-flex items-center justify-center transition", theme === "dark" ? "bg-bingo-black text-white bingo-shadow-sm" : "text-bingo-gray-500 hover:text-bingo-black")}
      >
        <Moon className="size-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        title="מערכת"
        className={cn("size-7 rounded-md inline-flex items-center justify-center transition", theme === "system" ? "bg-white text-bingo-black bingo-shadow-sm" : "text-bingo-gray-500 hover:text-bingo-black")}
      >
        <Monitor className="size-3.5" />
      </button>
    </div>
  );
}

/** Quick single-button toggle for header */
export function ThemeQuickToggle() {
  const { resolvedTheme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={resolvedTheme === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      className="size-9 rounded-lg text-bingo-gray-600 hover:text-bingo-black hover:bg-bingo-gray-100 inline-flex items-center justify-center transition"
    >
      {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
