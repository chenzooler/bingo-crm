import { cn } from "@/lib/utils";

const palette = [
  "bg-status-blue text-white",
  "bg-status-green text-bingo-black",
  "bg-status-orange text-white",
  "bg-status-purple text-white",
  "bg-status-pink text-white",
  "bg-status-yellow text-bingo-black",
];

function colorFor(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

export function Avatar({
  name,
  emoji,
  size = "md",
  className,
}: {
  name: string;
  emoji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  const sizeClass = size === "sm" ? "size-7 text-[10px]" : size === "lg" ? "size-12 text-base" : "size-9 text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-black flex-shrink-0 select-none",
        sizeClass,
        colorFor(name),
        className
      )}
      title={name}
    >
      {emoji ? <span className="text-[1.1em]">{emoji}</span> : initials}
    </span>
  );
}
