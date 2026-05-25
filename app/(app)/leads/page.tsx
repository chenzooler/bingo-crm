import { LeadsViewSwitcher } from "@/components/leads/LeadsViewSwitcher";
import { getPipeline } from "@/lib/data/static";
import { Search, Plus, Sparkles, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";

interface PageProps {
  searchParams: Promise<{ p?: string; s?: string }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pipe = sp.p ? getPipeline(sp.p) : undefined;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Hero header with 3D icon */}
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <Icon3D icon={<Users className="size-6" />} tone="bingo" size={56} />
            <div className="min-w-0">
              {pipe && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1 mb-1">
                  <Sparkles className="size-3" /> {pipe.label}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
                <span className="text-bingo-black">{pipe ? pipe.label : "כל הלידים"}</span>
                <span className="inline-flex items-center justify-center text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">
                  {pipe ? formatNumber(pipe.count) : "1,200+"}
                </span>
              </h1>
              <p className="text-[12px] text-bingo-gray-600 mt-1.5">
                {pipe ? `${formatNumber(pipe.count)} לידים בתהליך זה` : "כל הלידים, התהליכים והמשימות במקום אחד"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-3.5 rounded-xl bg-white border border-bingo-gray-200 text-[12px] font-bold inline-flex items-center gap-1.5 hover:bg-bingo-gray-100 transition">
              <Search className="size-3.5" /> חיפוש מתקדם
            </button>
            <button className="btn-vibrant">
              <Plus className="size-4" /> ליד חדש
            </button>
          </div>
        </div>
      </div>

      <LeadsViewSwitcher pipeline={sp.p} status={sp.s} />
    </div>
  );
}
