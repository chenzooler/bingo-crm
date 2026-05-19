import type { DailyStat } from "@/lib/data/admin-mock";
import { cn } from "@/lib/utils";

/** Compact sparkline for admin dashboards */
export function MiniChart({ data, color = "green", height = 60 }: { data: DailyStat[]; color?: "green" | "blue" | "orange" | "red"; height?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 240;
  const step = width / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${i * step},${height - (d.count / max) * (height - 4) - 2}`).join(" ");
  const areaPath = `M 0,${height} L ${points.replace(/ /g, " L ")} L ${width},${height} Z`;
  const colors = {
    green: { stroke: "#2EA10D", fill: "rgba(80,255,10,0.18)" },
    blue: { stroke: "#2D7BF7", fill: "rgba(45,123,247,0.15)" },
    orange: { stroke: "#FB923C", fill: "rgba(251,146,60,0.15)" },
    red: { stroke: "#EF4444", fill: "rgba(239,68,68,0.15)" },
  }[color];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <path d={areaPath} fill={colors.fill} />
      <polyline points={points} fill="none" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart({ data, color = "green", maxLabels = 7 }: { data: DailyStat[]; color?: "green" | "blue" | "orange"; maxLabels?: number }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const colors = {
    green: "from-bingo-green-dark to-bingo-green",
    blue: "from-blue-700 to-status-blue",
    orange: "from-orange-600 to-status-orange",
  }[color];
  const labelEvery = Math.ceil(data.length / maxLabels);
  return (
    <div>
      <div className="flex items-end h-32 gap-px">
        {data.map((d, i) => {
          const height = (d.count / max) * 100;
          return (
            <div key={d.date} className="flex-1 flex flex-col justify-end group relative">
              <div className={cn("rounded-t-sm bg-gradient-to-t opacity-90 hover:opacity-100 transition", colors)} style={{ height: `${height}%`, minHeight: 2 }} title={`${d.date}: ${d.count}`} />
            </div>
          );
        })}
      </div>
      <div className="flex h-5 gap-px mt-1">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center">
            {i % labelEvery === 0 && (
              <span className="text-[9px] font-mono text-bingo-gray-400">{d.date.slice(8, 10)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
